/**
 * HRM Test - An app to test various HRM sensor configuration options, and save HRM data
 * to a file for offline analysis.
 * It initially starts the hrm using default settings and updates the display whenever
 * raw HRM data is received.
 * Swiping the screen changes the LED power.
 * Pressing the button stops the HRM.
 * The top third of the screen shows the HRM parameters, including calculaed bpm.
 * The lower two thirds is a graph of raw HRM readings.
 * Graham Jones, 2023, based on official BangleJS hrrawexp app
 */

var counter = 15;
var logging_started;
var interval;

var fileClosed = 0;
//var Storage = require("Storage");
var file;
var fileName;

var screenSize = g.getHeight();
var screenH = g.getHeight();
var screenW = g.getWidth();
var textOriginY = 0;
var textOriginX = 0;
var textW = screenW;
var textH = screenH/2;
var graphOriginX = 0;
var graphOriginY = textOriginY + textH + 1;
var graphH = screenH - textH;
var graphW = screenW;

var HRVal = 0;          // latest HRM readings
var HRConfidence = 0;
var rawVals = [];     // Raw values read by i2c
rawVals.push(0);
var anlgVals = [];     // Raw values read from analogue pin.
anlgVals.push(0);
var envVals = [];     // Environment values by i2c
envVals.push(0);
var timeVals = [];
timeVals.push(getTime());
var rawBufSize = screenW;

var ledCurrentVals = [0x30, 0x50, 0x5A, 0xE0];
var ledCurrentIdx = 0;

var slot0LedCurrentVal = 15;  //64



function fileExists(fName){
  /**
   * Returns true if a file named by the string parameter fName exists in storage, or else 
   * returns false
   */
  s = require('Storage');
  var fileList = s.list();
  var fileExists = false;
  for (let i = 0; i < fileList.length; i++) {
        fileExists = fileList[i].includes(fName);
        if(fileExists){
          break;
        }
  }
  return fileExists;
}

function drawText() {
  //g.clear();
  g.clearRect(textOriginX,textOriginY,textW,textH);
  g.setColor("#CC00CC");
  g.setFontAlign(-1, -1, 0); // top left origin

  y = textOriginY;
  g.setFont("6x8", 3);
  g.drawString(HRVal, textOriginX, y);
  g.setFont("6x8", 2);
  g.drawString(HRConfidence+"%", textOriginX+70, y);
  g.setFont("6x8", 2);
  if (logging_started) {
    g.drawString(fileName, textOriginX+115, y);
  } else {
    g.drawString("STOP", textOriginX+115, y);
  }
  y = y + 28;
  g.setFont("6x8", 2);
  g.drawString(rawVals[rawVals.length -1], textOriginX + 0, y);
  g.drawString(envVals[envVals.length -1], textOriginX + 70, y);
  g.drawString(anlgVals[anlgVals.length -1], textOriginX + 130, y);

  y = y + 20;
  g.setFont("6x8", 2);
  g.drawString(slot0LedCurrentVal, textOriginX + 0, y);
  g.drawString(ledCurrentIdx, textOriginX + 70, y);
  g.drawString((timeVals[timeVals.length-1]-timeVals[0])+"s", textOriginX + 130, y);

  //g.setFont("6x8", 2);
  //g.setFontAlign(-1, -1);
  //g.drawString("+", screenSize-10, screenSize/2);
  //g.drawString("-", 10, screenSize/2);
  //g.drawString("GO",screenSize/2 , (screenSize/2)+(screenSize/5));
  //g.setColor("#ffffff");
  //g.setFontAlign(0, 0); // center font
  //g.setFont("6x8", 4);
  //g.drawString("^",screenSize/2 , 150);

  drawGraph();
  g.flip();
}


function drawGraph() {
  let i = 0;
  let y = 0;
  //g.clear();
  g.clearRect(graphOriginX,graphOriginY,graphOriginX + graphW, graphOriginY + graphH);

  // Draw raw values as solid bars
  let minVal = rawVals[0];
  let maxVal = minVal;
  for (i=0;i<rawVals.length; i++) {
    if (rawVals[i]<minVal) minVal = rawVals[i];
    if (rawVals[i]>maxVal) maxVal = rawVals[i];
  }
  let yMin = screenH;
  let yMax = graphOriginY;
  for (i=0;i<rawVals.length-1; i++) {
    y = yMin + (rawVals[i]-minVal)*(yMax-yMin)/(maxVal-minVal);
    if (y < yMax) y = yMax;   // Screen is inverted, so comparison looks wrong!
    if (y > yMin) y = yMin;
    g.setColor('#ff0000').drawRect(i,yMin,i+1,y);
  }
  console.log("drawGraph() - minVal="+minVal
    +", maxVal="+maxVal 
    + ", yMin="+yMin
    +", yMax="+yMax
    +", y="+y);

    // Draw analogue values as a line
    minVal = anlgVals[0];
    maxVal = minVal;
    for (i=0;i<anlgVals.length; i++) {
      if (anlgVals[i]<minVal) minVal = anlgVals[i];
      if (anlgVals[i]>maxVal) maxVal = anlgVals[i];
    }
    let lastPoint = [0,0]
    for (i=0;i<anlgVals.length-1; i++) {
      y = yMin + (anlgVals[i]-minVal)*(yMax-yMin)/(maxVal-minVal);
      if (y < yMax) y = yMax;   // Screen is inverted, so comparison looks wrong!
      if (y > yMin) y = yMin;
      g.setColor('#000000').drawLine(lastPoint[0],lastPoint[1],i+1,y);
      lastPoint=[i, y];
    }
  
}

function setLedCurrent() {
  console.log("setLedCurrent()");
  Bangle.hrmWr(0x17,slot0LedCurrentVal);
  //Bangle.hrmWr(0x19, ledCurrentVals[ledCurrentIdx]);
}

function getLedCurrent() {
  /**
   * Read the LED current registers from the HRM and populate the relevant global variables.
   */
  slot0LedCurrentVal = Bangle.hrmRd(0x17,0);
  ledCurentIdx = Bangle.hrmRd(0x19);
}

function changeLedCurrent(changeVal) {
  // Update the requested ledCurrent by changing its index by changeVal
  // Wraps around to the ends of ledCurrentVals if index is out of range.
  ledCurrentIdx += changeVal;
  if (ledCurrentIdx > ledCurrentVals.length -1 ) {
    ledCurrentIdx = 0;
  }
  if (ledCurrentIdx < 0) {
    ledCurrentIdx = ledCurrentVals.length -1;
  }
  setLedCurrent();
  drawText();
}

function changeSlot0Current(changeVal) {
  // Update the requested slot0Current by changing it
  // Wraps around to the upper or lower limit if it is out of range.
  slot0LedCurrentVal += changeVal;
  if (slot0LedCurrentVal > 0xef) {
    slot0LedCurrentVal = 0;
  }
  if (slot0LedCurrentVal < 0) {
    slot0LedCurrentVal = 0xef;
  }
  setLedCurrent();
  drawText();
}

function initialiseHrm() {
  Bangle.setLCDPower(1);
  Bangle.setHRMPower(1);
  Bangle.setOptions({
    backlightTimeout:0,
    powerSave:false,
    hrmPushEnv:true,
    hrmGreenAdjust: true
  });
  setLedCurrent();

}

function startStopHrm() {
  if (!logging_started) {
    console.log("startStopHrm - starting");
    fileName = "";
    var fileset = false;

    for (let i = 0; i < 5; i++) {
      fileName = "HRM_" + i.toString() + ".csv";
      if(fileExists(fileName) == 0){
        file = require("Storage").open(fileName,"w");
        console.log("creating new file " + fileName);
        fileset = true;
      }
      if(fileset){
        break;
      }
    }

    if (!fileset){
      fileName = "HRM_0.csv";
      console.log("overwiting file "+fileName);
      file = require("Storage").open(fileName,"w");
    }

    file.write("");
    file = require("Storage").open(fileName,"a");

    //launchtime = 0 | getTime();
    //file.write(launchtime + "," + "\n");
    logging_started = true;
    counter = counter * 60;
    interval = setInterval(countDownTimerCallback, 1000);

    initialiseHrm();

  } else {
    console.log("startStopHrm - stopping");
    Bangle.setHRMPower(0);
    clearInterval(interval);
    g.drawString("Done", g.getWidth() / 2, g.getHeight() / 2);
    Bangle.buzz(500, 1);
    fileClosed = 1;
    logging_started = false;

  }
}


function countDownTimerCallback() {
  /**
   * Called once per second by timer 'interval'
   */
  Bangle.setLocked(false);   // Prevent the touch screen locking so we can use scroll inputs
  getLedCurrent();
  drawText();
}


function fmtMSS(e) {
  h = Math.floor(e / 3600);
  e %= 3600;
  m = Math.floor(e / 60);
  s = e % 60;
  return h + ":" +  m + ':' + s;
}


///////////////////////////////////////
// Main Program 
console.log("Registering button callback");
setWatch(startStopHrm, BTN1, { repeat: true });
//setWatch(btn2Pressed, BTN2, { repeat: true });
//setWatch(btn3Pressed, BTN3, { repeat: true });

console.log("Registering swipe callback");
Bangle.on("swipe",function(directionLR, directionUD){
    if (1==directionLR){
        changeLedCurrent(1);
    }
   else if(directionLR == -1){
        changeLedCurrent(-1);
     }
    else if (directionUD ==1){
      changeSlot0Current(5);
    }
    else if (directionUD == -1) {
      changeSlot0Current(-5);
    }
  });

console.log("Registering raw hrm data callback");
Bangle.on('HRM-raw', function (hrm) {
        let value = hrm.raw;
        let filt = hrm.filt;
        let valueA = Math.round(analogRead(29)* 16383);
        rawVals.push(value); 
        anlgVals.push(valueA);
        timeVals.push(getTime());
        if (rawVals.length > rawBufSize) {
          rawVals.shift();
          anlgVals.shift();
          timeVals.shift();
        }
        file.write(timeVals[timeVals.length-1] + "," + value + "," + filt 
                + "," + valueA + "," + envVals[envVals.length-1] + "," + HRVal + "," + HRConfidence + "\n");
});

console.log("Registering hrm environment data callback");
Bangle.on('HRM-env', function (hrm) {
        let value = hrm;
        envVals.push(value); 
        if (envVals.length > rawBufSize) {
          envVals.shift();
        }
});



console.log("Registering hrm values callback");
Bangle.on('HRM', function (hrmB) {
        HRVal = hrmB.bpm;
        HRConfidence = hrmB.confidence;
});

// Start logging
startStopHrm();



