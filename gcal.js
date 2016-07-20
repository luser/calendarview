/*global gapi,moment*/
// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

var debug = window.location.search.indexOf('debug') != -1;
function log(...args) {
  if (debug) {
    console.log(...args);
  }
}

// Attempt to authenticate to Google, asking the user to grant read-only
// calendar access. Returns a Promise that is fulfilled after successfully
// authenticating and loading the calendar API library.
function google_auth(client_id) {
  return new Promise((resolve, reject) => {
    var scopes = 'https://www.googleapis.com/auth/calendar.readonly';
    function handle_auth_result(auth_result) {
      log('handle_auth_result(%s)', auth_result);
      var authorize_div = document.getElementById('authorize-div');
      // TODO: handle errors
      if (auth_result && !auth_result.error) {
        // Hide auth UI, then load calendar API.
        authorize_div.style.display = 'none';
        gapi.client.load('calendar', 'v3').then(resolve, reject);
      } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        var authorizeButton = document.getElementById('authorize-button');
        authorizeButton.onclick = () => {
          gapi.auth.authorize(
            {client_id: client_id, scope: scopes, immediate: false},
            handle_auth_result);
          return false;
        };
        authorize_div.style.display = 'inline';
      }
    }
    gapi.load('client',
              () => {
                log('loaded client');
                gapi.auth.authorize(
                  {
                    'client_id': client_id,
                    'scope': scopes,
                    'immediate': true
                  })
                  .then(handle_auth_result,
                        (e) => { console.error('authorize failed: %s', e); reject(e); });
              });
  });
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
        console.log('gcal: Got %d events', events.length);
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
