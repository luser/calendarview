/*global $ */
$(document).ready(function() {
  $('#calendar').fullCalendar({
    header: {
      left: '',
      center: 'title',
      right: ''
    },
    defaultView: 'agendaWeek',
    timezone: 'local'
  });
  // for each ICAL
  // addICALSource(url)
});

//TODO: periodically poll to set the current date
// $('#calendar').fullCalendar('today');

function addICALSource(url) {
  $('#calendar').fullCalendar('addEventSource', {id: url, events: ical_source(url) });
}
