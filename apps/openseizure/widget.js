/*
 * A 'Widget' that will run on a BangleJs watch face and provide
 * accelerometer data at 25 Hz and battery percentage on demand over BLE.
 *
 * 07 August 2020 - Gordon Williams:  Initial version providing an accelerometer data service.
 * 12 August 2020 - Graham Jones:  Added a battery percentage service.
 * 03 Oct 2023 - Graham Jones:  Added heart rate data service
 * Dec 2023 - Graham Jones:  Added watch ID and software versions
 * 							Added different accelerometer data formats.
 */

// Uncomment for testing in ram using webIDE (https://espruino.com/ide)
//WIDGETS = {};

// Valid values of CHAR_OSD_ACC_FMT
const ACC_FMT_8BIT = 0;
const ACC_FMT_16BIT = 1;
const ACC_FMT_3D = 3;

/////////////////////////////////
// Build Configuration
const WATCH_FW = "0.16";
const WATCH_ID = "BangleJs";
const ACC_FMT = ACC_FMT_3D;
const USE_TEST_ACC_DATA = false;  // FIXME - does not send real data when set to true

const SERV_OSD =          "000085e9-0000-1000-8000-00805f9b34fb";
const CHAR_OSD_ACC_DATA = "000085e9-0001-1000-8000-00805f9b34fb";   // Format depends on the value of CHAR_OSD_ACC_FMT
const CHAR_OSD_BAT_DATA = "000085e9-0002-1000-8000-00805f9b34fb";
const CHAR_OSD_WATCH_ID = "000085e9-0003-1000-8000-00805f9b34fb";
const CHAR_OSD_WATCH_FW = "000085e9-0004-1000-8000-00805f9b34fb";
const CHAR_OSD_ACC_FMT  = "000085e9-0005-1000-8000-00805f9b34fb";  // Valid values are ACC_FMT_xx as defined above

// Official BLE UUIDs from https://btprodspecificationrefs.blob.core.windows.net/assigned-numbers/Assigned%20Number%20Types/Assigned_Numbers.pdf
// Also based on bootgathrm bangle app.
const SERV_HRM = 0x180D;   // Official BLE UUID
const CHAR_HRM = 0x2A37;   // Official BLE UUID
const CHAR_HR_LOC = 0x2A38; // Official BLE Sensor Location UUID


var testAccVal = 0;

function getTestVal() {
	let retVal = testAccVal;
	testAccVal += 1;
	return retVal;
}

// From 'sensible.js' example app
function encodeAccel3DData(a) {
	let x = 0; let y = 0; let z = 0;
	x = toByteArray(int(1000*a.x), 2, true);
	y = toByteArray(int(1000*a.y), 2, true);
	z = toByteArray(int(1000*a.z), 2, true);
	return [
		x[0], x[1], y[0], y[1], z[0], z[1] // Accel 3D
	];
  }
  
  function encodeAccel16bitData(a) {
	let x = toByteArray(int(1000*a.mag), 2, false);
	return [
		x[0], x[1]
	];
  }  
  
// Convert the given value to a little endian byte array
// From 'sensible.js' example app
function toByteArray(value, numberOfBytes, isSigned) {
	let byteArray = new Array(numberOfBytes);
  
	if(isSigned && (value < 0)) {
		value += 1 << (numberOfBytes * 8);
	}
  
	for(let index = 0; index < numberOfBytes; index++) {
		byteArray[index] = (value >> (index * 8)) & 0xff;
	}
  
	return byteArray;
  }
  


(() => {
	var accelData = new Uint8Array(20);
	var accelIdx = 0;
	var accelArrayFull = false;
	var batteryLevel = 0;
	var hrVal = 0;

	function draw() {
		// Draw the OSD Icon
		g.reset();
		g.drawImage(E.toArrayBuffer(atob("GBiEBAAAAAABEREQAAAAAAAAAAAKmZkgAAAAAAAAAAAKmZkgAAAAAAAAAAAKkzkgAAAAAAACIQAKkzkgABIgAAAZmSAKPykgApmRAAApmZoqMjkiqZmSAAKZmZmZ8zmpmZmZIAKZmZmZMzmZmZmZIAEpmZmZkzqZmZmSEAACqZmZkjOZmZogAAAAApmZkjOZmSAAAAAAApmZn/mZmSAAAAACqZmZrymZmZogAAEpmZmZkzmZmZmSEAqZmZmZkjqZmZmZoAKZmZmamvmpmZmZIAApmZIan6mhKZmSAAAZmiAKkymgAqmRAAACIAAKkimgAAIgAAAAAAAKkimgAAAAAAAAAAAKmZmgAAAAAAAAAAAKmZmgAAAAAAAAAAABEREQAAAAAA==")), this.x, this.y);
	}


	// accelerometer data callback.
	Bangle.on('accel',function(a) {
		let accArr = []
		switch (ACC_FMT) {
			case ACC_FMT_8BIT:  // 8 bit vector magnitude scaled so 1g=64
				// Calculate vector magnitude of acceleration measurement, and scale it so 1g is value 64 (so we cover 0 to 4g)
				accelData[accelIdx++] = E.clip(a.mag*64,0,255);
				if (accelIdx >= accelData.length) 
					accelArrayFull = true;
				break;
			case ACC_FMT_16BIT:  // 16 bit vector magnitude in milli-g
				accArr = encodeAccel16bitData(a);
				for (let n=0; n<accArr.length;n++) {
					accelData[accelIdx] = accArr[n];
					accelIdx += 1
				}
				if (accelIdx >= (accelData.length - 2))  // One measurement needs 2 bytes
					accelArrayFull = true;
				break;
			case ACC_FMT_3D:  // 16 bit acceleration components in milli-g (x, y, z)
				accArr = encodeAccel3DData(a);
				for (let n=0; n<accArr.length;n++) {
					accelData[accelIdx] = accArr[n];
					accelIdx += 1
				}
				if (accelIdx >= (accelData.length - 6))  // One measurement needs 6 bytes (3 values at 2 bytes each)
					accelArrayFull = true;
				break;
			default:
				E.showMessage("Invalid ACC_FMT", "OSD_ERROR");
		} 

		// if our accelArray buffer is full, notify BLE subscribers that there is data to collect.
		if (accelArrayFull) {
			accelIdx = 0;
			accelArrayFull = false;
			batteryLevel = E.getBattery();
			try { 
				var charOsdAccData = {
					value : accelData,
					notify : true
					};
				var charOsdBatData = {
					value : batteryLevel,
					notify : true
				};
				var charBleHrm = {
					value : [0x06, hrVal],   // Check what 0x06 is?
					notify : true
				};
						
				var servOsd = {};
				servOsd[CHAR_OSD_ACC_DATA] = charOsdAccData;
				servOsd[CHAR_OSD_BAT_DATA] = charOsdBatData;
				var servHrm = {};
				servHrm[CHAR_HRM] = charBleHrm;
			
				var servicesCfg = {};
				servicesCfg[SERV_OSD] = servOsd;
				servicesCfg[SERV_HRM] = servHrm;

				NRF.updateServices(servicesCfg);
			} catch(e) {
				E.showMessage(e,"OSD ERROR")
			}
		}
	});

	// Initialise the HRM
	Bangle.setHRMPower(1);
	Bangle.on('HRM', function(hrm) { 
		hrVal = hrm['bpm'];
	});


	// Initialise accelerometer
	//http://kionixfs.kionix.com/en/datasheet/KX023-1025%20Specifications%20Rev%2012.0.pdf
	Bangle.accelWr(0x1B,0x01 | 0x40); // 25hz output, ODR/2 filter
	Bangle.setPollInterval(40); // 25hz input


	// Define OSD Service characteristics
	var charOsdAccData = {
		value : accelData,
		maxLen : 20,
		readable : true,
		notify : true
		};
	var charOsdBatData = {
		value : batteryLevel,
		maxLen : 20,
		readable : true,
		notify : true
	};
	var charOsdWatchId = {
		value : WATCH_ID,
		maxLen : 10,
		readable : true
	};
	var charOsdWatchFw = {
		value : WATCH_FW,
		maxLen : 8,
		readable : true
	};
	var charOsdAccFmt = {
		value : ACC_FMT,
		maxLen : 1,
		readable : true
	};

	// Define HRM Service Characteristics
	var charBleHrm = {
		value : [0x06, 0],   // Check what 0x06 is?
		maxLen : 2,
		readable : true,
		notify : true
	};
	var charBleHrLoc = { // Sensor Location: Wrist
		value : 0x02,
	};

	// Create the OSD Service Object from the characteristics
	var servOsd = {};
	servOsd[CHAR_OSD_ACC_DATA] = charOsdAccData;
	servOsd[CHAR_OSD_BAT_DATA] = charOsdBatData;
	servOsd[CHAR_OSD_WATCH_ID] = charOsdWatchId;
	servOsd[CHAR_OSD_WATCH_FW] = charOsdWatchFw;
	servOsd[CHAR_OSD_ACC_FMT] = charOsdAccFmt;

	// Create the HRM Service Object from the characteristics
	var servHrm = {};
	servHrm[CHAR_HRM] = charBleHrm;
	servHrm[CHAR_HR_LOC] = charBleHrLoc;

	// Create the combined services definition from the OSD and HRM services.
	var servicesCfg = {};
	servicesCfg[SERV_OSD] = servOsd;
	servicesCfg[SERV_HRM] = servHrm;

	NRF.setServices(servicesCfg);
	
	// add your widget
	WIDGETS["openseizure"]={
	area:"tl", width: 24, draw:draw
	};
})();



// Uncomment for testing in RAM using webIDE
//Bangle.drawWidgets();
