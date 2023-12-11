BLE Data Source API
===================

The BangleJS watch app in this repository is the 'reference' implementation of a Bluetooth / BLE Data source for OpenSeizureDetector.

The BLE interface is as follows:

| ------------------ | --------------------- | ------------------------------|
| Parameter          | UUID                  | Description                   |
| SERV_OSD           | 000085e9-0000-1000-8000-00805f9b34fb | OpenSeizureDetector BLE Service, which contains several characteristics as shown below |
| CHAR_OSD_ACC_DATA  | 000085e9-0001-1000-8000-00805f9b34fb | Accelerometer Data - sends thee sets of (x, y, z) accerometer values in milli-g (16 bit signed int) |
| CHAR_OSD_BAT_DATA  | 000085e9-0002-1000-8000-00805f9b34fb | Battery value as integer percent full |
| CHAR_OSD_WATCH_ID  | 000085e9-0003-1000-8000-00805f9b34fb | 20 bit string watch identifier |
| CHAR_OSD_WATCH_FW  | 000085e9-0004-1000-8000-00805f9b34fb | 20 byte string watch firmware version number |

| SERV_HRM           | 0x180D                                | Official haeart rate service UUID |
| CHAR_HRM           | 0x2A37;                               | Heart rate characteristic (2 bytes) |
| CHAR_HR_LOC        | 0x2A38;                               | Official BLE Sensor Location UUID |




