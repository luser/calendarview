/*global ICAL,$,log,moment */
// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

// Return a Promise that resolves to jCal data of the ICAL file at `url`.
function get_ical_data(url) {
  return new Promise((resolve, reject) => {
    var req = new XMLHttpRequest();
    req.onreadystatechange = (ev) => {
      if (req.readyState == 4) {
        if (req.status == 200) {
          resolve(ICAL.parse(req.responseText));
        } else {
          reject('Error, HTTP ' + req.status.toString());
        }
      }
    };
    req.onerror = e => reject(e);
    req.open('GET', url, true);
    req.send(null);
  });
}

// Return an EventSource that fetches events from the ICAL file at `url`.
function ical_event_source(url) {
  return {
    id: url,
    events: (start, end, timezone, callback) => {
      get_ical_data(url).then(data => {
        var comp = new ICAL.Component(data);
        var events = comp.getAllSubcomponents('vevent').map(ve => new ICAL.Event(ve));
        var color = comp.getFirstPropertyValue('x-apple-calendar-color');
        log('ical: Got %d events', events.length);
        callback(
          events
          //TODO: handle recurring events
            .filter(entry => !entry.isRecurring() && (moment(entry.startDate.toJSDate()).isBetween(start, end, null, '[]') || moment(entry.endDate.toJSDate()).isBetween(start, end, null, '[]')))
            .map(entry => {
              return {
                id: entry.uid,
                title: entry.summary,
                allDay: entry.startDate.isDate,
                start: entry.startDate.toJSDate(),
                end: entry.endDate.toJSDate(),
                color: color,
                location: entry.location,
                description: entry.description
              };
            }));
      });
    }
  };
}

