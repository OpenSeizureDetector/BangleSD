/*
 * A 'Widget' that will run on a BangleJs watch face and provide
 * accelerometer data at 25 Hz and battery percentage on demand over BLE.
 *
 * 07 August 2020 - Gordon Williams:  Initial version providing an accelerometer data service.
 * 12 August 2020 - Graham Jones:  Added a battery percentage service.
 */

const SERV_OSD =          "000085e9-0000-1000-8000-00805f9b34fb";
const CHAR_OSD_ACC_DATA = "000085ea-0000-1000-8000-00805f9b34fb";
const CHAR_OSD_BAT_DATA = "000085eb-0000-1000-8000-00805f9b34fb";

(() => {
	function draw() {
		g.reset();
		g.drawImage(E.toArrayBuffer(atob("GBiEBAAAAAABEREQAAAAAAAAAAAKmZkgAAAAAAAAAAAKmZkgAAAAAAAAAAAKkzkgAAAAAAACIQAKkzkgABIgAAAZmSAKPykgApmRAAApmZoqMjkiqZmSAAKZmZmZ8zmpmZmZIAKZmZmZMzmZmZmZIAEpmZmZkzqZmZmSEAACqZmZkjOZmZogAAAAApmZkjOZmSAAAAAAApmZn/mZmSAAAAACqZmZrymZmZogAAEpmZmZkzmZmZmSEAqZmZmZkjqZmZmZoAKZmZmamvmpmZmZIAApmZIan6mhKZmSAAAZmiAKkymgAqmRAAACIAAKkimgAAIgAAAAAAAKkimgAAAAAAAAAAAKmZmgAAAAAAAAAAAKmZmgAAAAAAAAAAABEREQAAAAAA==")), this.x, this.y);
	}

	var accelData = new Uint8Array(20);
	var accelIdx = 0;
	var batteryLevel = 0;
	//http://kionixfs.kionix.com/en/datasheet/KX023-1025%20Specifications%20Rev%2012.0.pdf
	Bangle.accelWr(0x1B,0x01 | 0x40); // 25hz output, ODR/2 filter
	Bangle.setPollInterval(40); // 25hz input
	Bangle.on('accel',function(a) {
	accelData[accelIdx++] = E.clip(a.mag*64,0,255);
	if (accelIdx>=accelData.length) {
		accelIdx = 0;
		batteryLevel = E.getBattery();
		try { NRF.updateServices({
		[SERV_OSD] : {
			[CHAR_OSD_ACC_DATA] : {
			value : accelData, notify : true
			},
			[CHAR_OSD_BAT_DATA] : {
			value : batteryLevel, notify : true
			}
		}
		});} catch(e) {}
	}
	});

	NRF.setServices({
	[SERV_OSD] : {
		[CHAR_OSD_ACC_DATA] : {
		value : accelData,
		maxLen : 20,
		readable : true,
		notify : true
		},
		[CHAR_OSD_BATT_DATA]: {
		value : batteryLevel,
		maxLen : 20,
		readable : true,
		notify : true
		}
	}
	});
	
	// add your widget
	WIDGETS["openseizure"]={
	area:"tl", width: 24, draw:draw
	};
})();

