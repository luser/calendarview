This project provides a read-only HTML calendar view using [fullcalendar][1].
It is intended for use on a wall-mounted display, such as a tablet.

There's no server required (beyond the one that hosts your calendar data),
so you can [try it out here](https://luser.github.io/calendarview).

There's a very minimal user interface for adding calendars—click the settings icon in the top right, and click _Add Google Calendars_ to connect to your Google account and load all of your Google calendars, or type a URL to an ICS file in the _ICS URL_ text field and click _Add ICS Calendar_ to load events from the ICS file at that URL. (Click the settings icon again to hide the settings dialog.)

Some useful features:
* Refreshes calendar events periodically
* Attempts to keep the display showing only the six days starting with the current day
* The list of added calendars will be saved in your browser's storage so it will persist between visits.
* The page will reload if new code changes have been pushed to the repository.

Any copyright is dedicated to the Public Domain.  
http://creativecommons.org/publicdomain/zero/1.0/


[1]: http://fullcalendar.io/
