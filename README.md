A BangleJS Watch App Data Source for OpenSeizureDetector
========================================================

[OpenSeizureDetector](https://openseizuredetector.org.uk) is a free, Open Source Epileptic Seizure Detector
which monitors body movement and heart rate using a smart watch and generates alarms to alert a carer if a seizure is detected.

It is possible to use a [BanjgleJS 2](https://banglejs.com/) watch as a data source for a development version OpenSeizureDetector as described in this document.

This repository contains the watch app and the web based app loader to install the OpenSeizureDetector app on the BangleJS watch.   

If you are looking for other BangleJS apps, please look at the main Bangle JS app store at at [banglejs.com/apps](https://banglejs.com/apps).  But note though that some other BangleJS apps will interfere with the OpenSeizureDetector functionality, so I recommend you are very careful about installing other apps alongside OpenSeizureDetector.

This page is rendered at [here](https://openseizuredetector.github.io/BangleSD/index.html)

For details of how this works, please refer to the official [BangleJS repository](https://github.com/espruino/BangleApps)

The source code for the OpenSeizureDetector app for BangleJS is stored in the [apps/openseizure](apps/openseizure) folder.    The rest of the code is a copy of the app loader provided by the [Espruino project](https://github.com/espruino/BangleApps).

For problems with the OpenSeizureDetector app itself, please contact graham@openseizuredetector.org.uk, or raise an [issue](https://github.com/OpenSeizureDetector/BangleSD/issues) in this repository.

Current Status
--------------

  - Currently in the initial testing state.   
  - V0.12 and higher runs using V4.2.x of the [OpenSeizureDetector Android App](https://github.com/OpenSeizureDetector/Android_Pebble_SD/tree/V4.2.x).
  - The watch app has a settings page that allows the user to select the accelerometer data transfer mode:
        - 0 - 8 bit vector magnitude (lowest data transfer rate, so lowest power consumption)
        - 1 - 16 bit vector magnitude (comparable to Garmin 'low data' mode.
        - 3 - 3 x 16 bit acceleration components (x, y, z) - most useful for Data Sharing and future algorithms, but highest power consumption.
  - The BangleJS Heart rate appears higher than I would see on a Garmin (about 100 bpm rather than 60 bpm, unless the wearer is very still).
  - The battery indication is a bit noisy - could do with calculating an averge to reduce noise.
  - There is no feedback about the app state on the watch, no mute function.
  - Watch battery life is good - 100% to 75% in 10 hours, so should exceed 15 hours target easily (on 8 bit accelerometer data transfer (mode 0 above).
  - Please see the current [issues here](https://github.com/OpenSeizureDetector/BangleSD/issues).


Installation
------------

  - Charge the BangleJS battery.
  - Power on the BangleJS by pressing the button
  - If this is the first run, you will see an introductory presentation about how to use BangleJS
  - When it finishes, press the button again to start BangleJS
  - In a web browser that supports WebBluetooth (e.g. Chrome):
     - Go to https://openseizuredetector.github.io/BangleSD/index.html
     - Select the BangleJS 2 option
     - Press the Connect button in the top right hand corner of the screen, then when your BangleJS watch appears in the search dialog box, select it and press 'Pair'
     - If the BangleJS watch is not shown, it may still be connected to the phone - switching off bluetooth on the phone temporarily will make sure it is disconnected.
     - Check the "Firmware Update", "Bootloader" and "Launcher" apps.  If they are showing a round arrow 'update' icon, press the icon button to update the apps to the latest versions.  (These are BangleJS system apps so we want to be sure users are using a known version).
     - [optional] you can add the Heart Rate Monitor and Heart Rate Widget aps if desired.
     - Look for the OpenSeizureDetector widget in the (short) list of available apps.
     - Select the up arrow to upload the OpenSeizureDetector widget to the watch.
     - When it completes, press the 'Disconnect' button on the web browser.
  - The watch should now display 'Hold Button to Reload' - press and hold the watch button.
  - When the watch re-starts it should show the OpenSeizureDetector logo in the top left hand corner of the screen.

  The watch should now be ready to connect to the OpenSeizureDetector Android App and send data - it will do this without starting a specific watch app as it runs in the background continuously.

  By default, the watch sends acceleration data in the lowest resolution (8 bits per measurement).   For compatibility with future algorithms it would be best to send 3D data at 3x16 bits per measurement.   This can be enabled on the watch by selecting settings->apps->OSD and selecting '3' for the acceleration data format (once I am happy this is stable I will make 3d data the default).

  Start the Android App (V4.2.x or higher), select "Bluetooth Device" data source, then in general settings, click the "SELECT BLE DEVICE" button to choose which watch to connect to.   After about 5 seconds the phone app should display data with 'OK' status.


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
       - A github action should run to deploy the app loader to the [OpenSeizureDetector Github site](https://openseizuredetector.github.io/BangleSD/index.html?q=opens)
         - Go to https://openseizuredetector.github.io/BangleApps/index.html?q=opens
         - Connect to the BangleJS watch
         - Update the OpenSeizureDetector widget
         - Disconnect from the app loader or the BLE servies will not be advertised.
    - Command line (Working on Ubuntu 22.04 LTS)
      - Initialise the submodules to obtain the data transfer utilities
         - cd BangleSD
         - git submodule init; git submodule update
      - Install nodejs and npm, and noble library
         - sudo apt install nodejs, npm
         - npm install @abandonware/noble
      - Execute with core/tools/apploader.js 
         - core/tools/apploader.js list      - lists available apps (just openseizure for this repository)
         - sudo core/tools/apploader.js devices   - should list available banglejs devices, but it is not returning anything for me for some reason
         - sudo core/tools/apploader.js install openseizure  (specify the MAC address if you have more than one BangleJS device in range).


## Credits
 [The Espruino Project](https://github.com/espruino/) 
