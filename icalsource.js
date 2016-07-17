/*global ICAL,$ */
function get_ical_data(url) {
  return new Promise((resolve, reject) => {
    var req = new XMLHttpRequest();
    req.onreadystatechange = (ev) => {
      if (req.readyState == 4 && req.status == 200) {
        resolve(ICAL.parse(req.responseText));
      }
    };
    req.open("GET", url, true);
    req.send(null);
  });
}

function ICALSource(url) {
  this.url = url;
  this.events = [];
  this.event_promise = new Promise((resolve, reject) => {
    get_ical_data(url).then(data => {
      var comp = new ICAL.Component(data);
      this.events = comp.getAllSubcomponents("vevent").map(ve => new ICAL.Event(ve));
      this.event_promise = null;
      resolve(this.events);
    });
  });
}

ICALSource.prototype = {
  get_events: function() {
    if (this.event_promise == null) {
      return Promise.resolve(this.events);
    } else {
      return this.event_promise;
    }
  }
};

function ical_source(url) {
  var source = new ICALSource(url);
  return function(start, end, timezone, callback) {
    source.get_events().then(source_events => {
      console.log('Got %d calendar events', source_events.length);
      var events = [];
      for (var entry of source_events) {
        if (entry.isRecurring())
          //TODO: handle recurring events
          continue;
        if ($.fullCalendar.moment(entry.startDate.toJSDate()).isBetween(start, end, null, '[]') || $.fullCalendar.moment(entry.endDate.toJSDate()).isBetween(start, end, null, '[]')) {
          console.log('Adding event %s', entry.summary);
          events.push({
            id: entry.uid,
            title: entry.summary,
            allDay: entry.startDate.isDate,
            start: entry.startDate.toJSDate(),
            end: entry.endDate.toJSDate(),
            url: url,
            location: entry.location,
            description: entry.description
          });
        }
      }
      callback(events);
    });
  };
}

