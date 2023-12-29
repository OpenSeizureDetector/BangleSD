Display and Log HRM Raw Data
============================

When started, this app starts the HRM and displays a number of values on a 3x3 grid,
with a graph below.

The values displayed are:
| HR (bpm) | Confidence (%) | Log Filename |
| Latest Raw Reading | Latest Environment Reading | Latest Analogue Reading |
| Register 0x17 LED Intensity | Register 0x19 LED Intensity | Period (seconds) covered by the graph | 

Pressing the physical watch button stopps the logging and saves the file - it can be retrieved using the espruino [web IDE](https://www.espruino.com/ide/)

It is pretty rough as an application at the moment, but if you run it for a few seconds you can see things changing which is useful.   The issues I know about with it are listed below - I will fix them soon, unless I abandon BanlgleJS in favour of PineTime for a while given the amount of trouble this HRM is causing!

Notes / issues:
  - This version has the hrmGreenAdjust option set to true, so you can see the HRM device changing the LED intensity.
  - If you change hrmGreenAdjust to false in the source code you should be able to change the LED intensity  with vertical swipes of the screen.
  - The environment intensity callback is never triggered for some reason, so this is always zero.
  - The register 0x19 value does not seem to change.
  - It is supposed to only maintain 170 hrm readings, so the graph should cover just under 7
  seconds of data - but something is not right about how I am managing the data arrays because the data period keeps going up.
  - The Analoge value is read from pin 29 as recommended here: https://forum.espruino.com/comments/17236199/, but I do not think it is reading the heart rate value.


