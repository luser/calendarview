This project provides a read-only HTML calendar view using [fullcalendar][1].
It is intended for use on a wall-mounted display, such as a tablet.

It currently only supports loading iCal (ICS) files, and there's no user
interface for configuring things. You can open the browser console and
manually add calendars like:
```js
add_calendar('ical', 'http://...')
```

There's no server required (beyond the one that hosts your calendar data),
so you can try it out here: https://luser.github.io/calendarview .

The list of added calendars will be saved in your browser's storage.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/

[1]: http://fullcalendar.io/
