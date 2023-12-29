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
var value;
var filt;

var fileClosed = 0;
var Storage = require("Storage");
var file;

var screenSize = g.getHeight();
var screenH = g.getHeight();
var screenW = g.getWidth();
var textOriginY = 0;
var textOriginX = 0;
var textW = screenW;
var textH = screenH/3;
var graphOriginX = 0;
var graphOriginY = textOriginY + textH + 1;
var graphH = screenH - textH;
var graphW = screenW;

var HRVal = 0;          // latest HRM readings
var HRConfidence = 0;
var rawVals = [];     // Raw values read by i2c
var algVals = [];     // Raw values read from analogue pin.
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
    g.drawString("RUN", textOriginX+115, y);
  } else {
    g.drawString("STOP", textOriginX+115, y);
  }

  y = y + 28;
  g.setFont("6x8", 3);
  g.drawString(slot0LedCurrentVal, textOriginX + 0, y);
  g.drawString(ledCurrentIdx, textOriginX + 70, y);
  g.drawString(rawVals.length, textOriginX + 130, y);

  g.setFont("6x8", 2);
  //g.setFontAlign(-1, -1);
  g.drawString("+", screenSize-10, screenSize/2);
  g.drawString("-", 10, screenSize/2);
  g.drawString("GO",screenSize/2 , (screenSize/2)+(screenSize/5));
  //g.setColor("#ffffff");
  //g.setFontAlign(0, 0); // center font
  g.setFont("6x8", 4);
  g.drawString("^",screenSize/2 , 150);

  drawGraph();
  g.flip();
}


function drawGraph() {
  //g.clear();
  g.clearRect(graphOriginX,graphOriginY,graphOriginX + graphW, graphOriginY + graphH);
  var minVal = rawVals[0];
  var maxVal = minVal;
  for (var i=0;i<rawVals.length; i++) {
    if (rawVals[i]<minVal) minVal = rawVals[i];
    if (rawVals[i]>maxVal) maxVal = rawVals[i];
  }
  var yMin = screenH;
  var yMax = graphOriginY;
  console.log("drawGraph() - minVal="+minVal+", maxVal="+maxVal);
  for (var i=0;i<rawVals.length-1; i++) {
    var y = yMin + (rawVals[i]-minVal)*(yMax-yMin)/(maxVal-minVal);
    g.drawRect(i,yMin,i+1,y);
  }
}

function setLedCurrent() {
  console.log("setLedCurrent()");
  Bangle.hrmWr(0x17,slot0LedCurrentVal);
  //Bangle.hrmWr(0x19, ledCurrentVals[ledCurrentIdx]);
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
  Bangle.setHRMPower(1);
  Bangle.setOptions({
    hrmGreenAdjust: false
  });
  setLedCurrent();

}

function startStopHrm() {
  if (!logging_started) {
    console.log("startStopHrm - starting");
    var filename = "";
    var fileset = false;

    for (let i = 0; i < 5; i++) {
      filename = "HRM_data" + i.toString() + ".csv";
      if(fileExists(filename) == 0){
        file = require("Storage").open(filename,"w");
        console.log("creating new file " + filename);
        fileset = true;
      }
      if(fileset){
        break;
      }
    }

    if (!fileset){
      console.log("overwiting file");
      file = require("Storage").open("HRM_data.csv","w");
    }

    file.write("");
    file = require("Storage").open(filename,"a");

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

function fmtMSS(e) {
    h = Math.floor(e / 3600);
    e %= 3600;
    m = Math.floor(e / 60);
    s = e % 60;
    return h + ":" +  m + ':' + s;
}

function countDownTimerCallback() {
  /**
   * Called once per second by timer 'interval'
   */
  drawText();
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
        value = hrm.raw;
        filt = hrm.filt;
        let alg = Math.round(analogRead(29)* 16383);
        rawVals.push(alg); // FIXME - pushing analogue value for testing
        //algVals.push(alg)
        if (rawVals.length > rawBufSize) {
          rawVals.shift();
          //algVals.shift();
        }
        //var dataArray = [value,filt,HRVal,HRConfidence];
        file.write(getTime() + "," + value + "," + filt 
                + "," + HRVal + "," + HRConfidence + "\n");
});

console.log("Registering hrm values callback");
Bangle.on('HRM', function (hrmB) {
        HRVal = hrmB.bpm;
        HRConfidence = hrmB.confidence;
});

drawText();



