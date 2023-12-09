OpenSeizureDetector BangleJS App Loader
=======================================

[OpenSeizureDetector](https://openseizuredetector.org.uk) is a free, Open Source Epileptic Seizure Detector
which monitors body movement and heart rate using a smart watch and generates alarms to alert a carer if a seizure is detected.

It is possible to use a [BanjgleJS 2](https://banglejs.com/) watch with an experimental, testing version OpenSeizureDetector as described in this document.

This repository contains the watch app and the app loader to install the OpenSeizureDetector app for the BangleJS watch.   

If you are looking for other BangleJS apps, please look at the main Bangle JS app store at at [banglejs.com/apps](https://banglejs.com/apps).  But note though that some other BangleJS apps will interfere with the OpenSeizureDetector functionality, so I recommend you are very careful about installing other apps alongside OpenSeizureDetector.

This page is rendered at [here](https://openseizuredetector.github.io/BangleApps/index.html)

For details of how this works, please refer to the official [BangleJS repository](https://github.com/espruino/BangleApps)

The source code for the OpenSeizureDetector app for BangleJS is stored in the [apps/openseizure](apps/openseizure) folder.    The rest of the code is a copy of the app loader provided by the [Espruino project](https://github.com/espruino/BangleApps).

For problems with the OpenSeizureDetector app itself, please contact graham@openseizuredetector.org.uk, or raise an [issue](https://github.com/OpenSeizureDetector/BangleApps/Issues) in this repository.

Current Status
--------------

  - Currently in the initial testing state.   
  - V0.12 and higher runs using V4.2.x of the [OpenSeizureDetector Android App](https://github.com/OpenSeizureDetector/Android_Pebble_SD/tree/V4.2.x).
  - It only transmits vector magnitude data to the phone, not 3d data (so works with the normal OSD algorithm, but not good for data sharing)
  - The vector magnitude is transmitted in 8 bits per measurement, scaled to give 0-4G range.   (Need to compare this to Garmin)
  - The BangleJS Heart rate appears higher than I would see on a Garmin (about 100 bpm rather than 60 bpm).
  - The battery indication is a bit noisy - could do with calculating an averge to reduce noise.
  - There is no feedback about the app state on the watch, no mute function.


Installation
------------

  - Charge the BangleJS battery.
  - Power on the BangleJS by pressing the button
  - If this is the first run, you will see an introductory presentation about how to use BangleJS
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

  Start the Android App (V4.2.x or higher), select "Bluetooth Device" data source, then in general settings, click the "SELECT BLE DEVICE" button to choose which watch to connect to .


  Development
  -----------
    - Use the Espruino [WebIDE](https://www.espruino.com/ide/)
       - Uncomment the WIDGETS={}; and Bangle.drawWidgets(); lines from the top and bottom of the [widget.js](apps/openseizure/widget.js) file.
       - Copy the contents of widget.js into the Web IDE
       - Upload the code to the watch RAM using the Web IDE
       - Disconnect the Web IDE or the BLE services will not advertise.
    - Deploy on Github pages
       - Update [medatadata.json](apps/openseizure/metadata.json) and [Changelog](apps/openseizure/ChangeLog) so that they both contain the same version number (or the automatic Github pages build will fail).
       - Commit the changes and push to github.
       - A github action should run to deploy the app loader to the [OpenSeizureDetector Github site](https://openseizuredetector.github.io/BangleApps/index.html?q=opens)
         - Go to https://openseizuredetector.github.io/BangleApps/index.html?q=opens
         - Connect to the BangleJS watch
         - Update the OpenSeizureDetector widget
         - Disconnect from the app loader or the BLE servies will not be advertised.


## Credits
 [The Espruino Project](https://github.com/espruino/) 
