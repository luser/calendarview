/*global $,ical_event_source,moment,setInterval,setTimeout */
$(document).ready(function() {
  $('#calendar').fullCalendar({
    header: {
      left: '',
      center: 'title',
      right: ''
    },
    // I don't like how the week agenda shows days that
    // are already past.
    defaultView: 'agendaSixDay',
    timezone: 'local',
    views: {
      agendaSixDay: {
        type: 'agenda',
        duration: { days: 6 },
        buttonText: '6 day'
      }
    }
  });
  // for each ICAL
  // addICALSource(url)
  // Refresh calendar sources every 5 minutes.
  setInterval(() => $('#calendar').fullCalendar('refetchEvents'), 5 * 60 * 1000);
  // Ensure that the current day is showing.
  check_current_day();
});

function check_current_day() {
  // Set the calendar to show the current day.
  $('#calendar').fullCalendar('today');
  // Check again when the day rolls over to tomorrow.
  var tomorrow = moment().add(1, 'day').startOf('day');
  var now = moment();
  setTimeout(check_current_day, tomorrow.diff(now));
}

//TODO: add a way to add ICAL sources that is saved in IDB or something

function addICALSource(url) {
  $('#calendar').fullCalendar('addEventSource', ical_event_source(url));
}
