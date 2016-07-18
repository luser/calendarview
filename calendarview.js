/*global $,ical_event_source,setInterval */
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
});

//TODO: add a way to add ICAL sources that is saved in IDB or something
//TODO: periodically poll to set the current date
// $('#calendar').fullCalendar('today');

function addICALSource(url) {
  $('#calendar').fullCalendar('addEventSource', ical_event_source(url));
}
