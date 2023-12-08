/*
 * A 'Widget' that will run on a BangleJs watch face and provide
 * accelerometer data at 25 Hz and battery percentage on demand over BLE.
 *
 * 07 August 2020 - Gordon Williams:  Initial version providing an accelerometer data service.
 * 12 August 2020 - Graham Jones:  Added a battery percentage service.
 * 03 Oct 2023 - Graham Jones:  Added heart rate data service
 */

const WATCH_FW = "0.12";
const WATCH_ID = "BangleJs";

const SERV_OSD =          "000085e9-0000-1000-8000-00805f9b34fb";
const CHAR_OSD_ACC_DATA = "000085e9-0001-1000-8000-00805f9b34fb";
const CHAR_OSD_BAT_DATA = "000085e9-0002-1000-8000-00805f9b34fb";
const CHAR_OSD_WATCH_ID = "000085e9-0003-1000-8000-00805f9b34fb";
const CHAR_OSD_WATCH_FW = "000085e9-0004-1000-8000-00805f9b34fb";

// Official BLE UUIDs from https://btprodspecificationrefs.blob.core.windows.net/assigned-numbers/Assigned%20Number%20Types/Assigned_Numbers.pdf
// Also based on bootgathrm bangle app.
const SERV_HRM = 0x180D;   // Official BLE UUID
const CHAR_HRM = 0x2A37;   // Official BLE UUID
const CHAR_HR_LOC = 0x2A38; // Official BLE Sensor Location UUID

(() => {
	var accelData = new Uint8Array(20);
	var accelIdx = 0;
	var batteryLevel = 0;
	var hrVal = 0;

	function draw() {
		// Draw the OSD Icon
		g.reset();
		g.drawImage(E.toArrayBuffer(atob("GBiEBAAAAAABEREQAAAAAAAAAAAKmZkgAAAAAAAAAAAKmZkgAAAAAAAAAAAKkzkgAAAAAAACIQAKkzkgABIgAAAZmSAKPykgApmRAAApmZoqMjkiqZmSAAKZmZmZ8zmpmZmZIAKZmZmZMzmZmZmZIAEpmZmZkzqZmZmSEAACqZmZkjOZmZogAAAAApmZkjOZmSAAAAAAApmZn/mZmSAAAAACqZmZrymZmZogAAEpmZmZkzmZmZmSEAqZmZmZkjqZmZmZoAKZmZmamvmpmZmZIAApmZIan6mhKZmSAAAZmiAKkymgAqmRAAACIAAKkimgAAIgAAAAAAAKkimgAAAAAAAAAAAKmZmgAAAAAAAAAAAKmZmgAAAAAAAAAAABEREQAAAAAA==")), this.x, this.y);
	}


	// accelerometer data callback.
	Bangle.on('accel',function(a) {
	accelData[accelIdx++] = E.clip(a.mag*64,0,255);
	if (accelIdx>=accelData.length) {
		accelIdx = 0;
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
			//var charOsdHrData = {
			//	value : hrVal,
			//	notify : true
			//};
			var charBleHrm = {
				value : [0x06, hrVal],   // Check what 0x06 is?
				notify : true
			};
		
		
			var servOsd = {};
			servOsd[CHAR_OSD_ACC_DATA] = charOsdAccData;
			servOsd[CHAR_OSD_BAT_DATA] = charOsdBatData;
			//servOsd[CHAR_OSD_HR_DATA] = charOsdHrData;
			var servHrm = {};
			servHrm[CHAR_HRM] = charBleHrm;
		
			var servicesCfg = {};
			servicesCfg[SERV_OSD] = servOsd;
			servicesCfg[SERV_HRM] = servHrm;

			NRF.updateServices(servicesCfg);
		} catch(e) {}
	}
	});


	Bangle.on('HRM', function(hrm) { 
		hrVal = hrm['bpm'];
	});


	// Initialise accelerometer
	//http://kionixfs.kionix.com/en/datasheet/KX023-1025%20Specifications%20Rev%2012.0.pdf
	Bangle.accelWr(0x1B,0x01 | 0x40); // 25hz output, ODR/2 filter
	Bangle.setPollInterval(40); // 25hz input

	// Switch on the heart rate monitor
	Bangle.setHRMPower(1);


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
	var charBleHrm = {
		value : [0x06, 0],   // Check what 0x06 is?
		maxLen : 2,
		readable : true,
		notify : true
	};
	var charBleHrLoc = { // Sensor Location: Wrist
		value : 0x02,
	};
	var servOsd = {};
	servOsd[CHAR_OSD_ACC_DATA] = charOsdAccData;
	servOsd[CHAR_OSD_BAT_DATA] = charOsdBatData;
	servOsd[CHAR_OSD_WATCH_ID] = charOsdWatchId;
	servOsd[CHAR_OSD_WATCH_FW] = charOsdWatchFw;
	var servHrm = {};
	servHrm[CHAR_HRM] = charBleHrm;
	servHrm[CHAR_HR_LOC] = charBleHrLoc;
	var servicesCfg = {};
	servicesCfg[SERV_OSD] = servOsd;
	servicesCfg[SERV_HRM] = servHrm;

	NRF.setServices(servicesCfg);
	
	// add your widget
	WIDGETS["openseizure"]={
	area:"tl", width: 24, draw:draw
	};
})();

