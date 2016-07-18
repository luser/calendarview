/*global $,ical_event_source */
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
});

//TODO: add a way to add ICAL sources that is saved in IDB or something
//TODO: periodically poll to set the current date
// $('#calendar').fullCalendar('today');
//TODO: periodically refresh calendar sources
// $('#calendar').fullCalendar('refetchEvents')


function addICALSource(url) {
  $('#calendar').fullCalendar('addEventSource', ical_event_source(url));
}
