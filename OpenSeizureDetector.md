Using OpenSeizureDetector on BangleJS2
======================================

About
-----

[OpenSeizureDetector](https://openseizuredetector.org.uk) is a free, Open Source Epileptic Seizure Detector
which monitors body movement and heart rate using a smart watch.

It is possible to use a [BanjgleJS 2](https://banglejs.com/) watch with an experimental, testing version OpenSeizureDetector as described in this document.

Installation
------------

  - Charge the BangleJS battery.
  - Power on the BangleJS by pressing the button
  - If this is the first run, you will see an introductory presentation about how to use BagleJS
  - When it finishes, press the button again to start BangleJS
  - In a web browser that supports WebBluetooth (e.g. Chrome), go to https://openseizuredetector.github.io/BangleApps/index.html
  - Select the BangleJS 2 option
  - Press the Connect button in the top right hand corner of the screen, then when your BangleJS watch appears in the search dialog box, select it and press 'Pair'
  - Type 'openseizuredetector' in the search box - this should find an OpenSeizureDetector widget.
  - Select the up arrow to upload the OpenSeizureDetector widget to the watch.
  - When it completes, press the 'Disconnect' button on the web browser.
  - The watch should now display 'Hold Button to Reload' - press and hold the watch button.
  - When the watch re-starts it should show the OpenSeizureDetector logo in the top left hand corner of the screen.

  The watch should now be ready to connect to the OpenSeizureDetector Android App and send data - it will do this without starting a specific watch app.
