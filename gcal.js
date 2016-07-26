/*global gapi,log,moment*/
// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

// Attempt to authenticate to Google, asking the user to grant read-only
// calendar access. Returns a Promise that is fulfilled after successfully
// authenticating and loading the calendar API library.
function google_auth(client_id) {
  return new Promise((resolve, reject) => {
    var scopes = 'https://www.googleapis.com/auth/calendar.readonly';
    function finish_authorize() {
      log('finish_authorize');
      gapi.client.load('calendar', 'v3').then(resolve, reject);
    }
    function update_signin_status(status) {
      log('update_signin_status: %s', status);
      if (status) {
        finish_authorize();
      }
    }
    function do_login(auth) {
      if (auth.isSignedIn.get()) {
        finish_authorize();
      } else {
        auth.isSignedIn.listen(update_signin_status);
        auth.signIn();
      }
    }
    gapi.load('client:auth2', () => {
      log('loaded auth2');
      var auth = gapi.auth2.getAuthInstance();
      if (auth == null) {
        gapi.auth2.init({
          client_id: client_id,
          scope: scopes
        }).then(() => {
          log('auth2 initialized');
          do_login(gapi.auth2.getAuthInstance());
        });
      } else {
        do_login(auth);
      }
    });
  });
}

function google_logout() {
  gapi.auth2.getAuthInstance().signOut();
}

function gcal_list_calendars() {
  function list_calendars_page(page_token=null) {
    var options = {
      'fields': 'items(id,selected,summary),nextPageToken'
    };
    if (page_token) {
      options.pageToken = page_token;
    }
    return gapi.client.calendar.calendarList.list(options);
  }

  return new Promise((resolve, reject) => {
    var calendars = [];
    function handle_page(res) {
      calendars.push(...res.result.items);
      if (!res.result.nextPageToken) {
        resolve(calendars);
      } else {
        list_calendars_page(res.result.nextPageToken).then(handle_page, reject);
      }
    }
    list_calendars_page().then(handle_page, reject);
  });
}

function gcal_get_calendar(calendar_id) {
  return gapi.client.calendar.calendarList.get({
    calendarId: calendar_id,
    fields: 'backgroundColor,id,summary'
  }).then(res => res.result);
}

function gcal_list_events(calendar_id, start, end) {
  start = moment(start);
  end = moment(end);
  return gapi.client.calendar.events.list({
    calendarId: calendar_id,
    singleEvents: true,
    timeMin: start.toISOString(),
    timeMax: end.toISOString()
    //TODO: support pagination
  }).then(res => res.result.items);
}

function google_event_source(calendar_id) {
  return {
    id: calendar_id,
    events: (start, end, timezone, callback) => {
      window.dates = {start: start, end: end};
      Promise.all([gcal_get_calendar(calendar_id),
                   gcal_list_events(calendar_id, start, end)])
      .then(([calendar, events]) => {
        var color = calendar.backgroundColor || null;
        log('gcal: Got %d events', events.length);
        callback(events
                 .map(entry => {
                   return {
                     id: entry.id,
                     title: entry.summary,
                     allDay: !!entry.start.date,
                     start: entry.start.dateTime || entry.start.date,
                     end: entry.end.dateTime || entry.end.date,
                     color: color,
                     location: entry.location,
                     description: entry.description
                   };
                 }));
      });
    }
  };
}
