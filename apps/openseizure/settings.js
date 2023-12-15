(function(back) {
    var FILE = "openseizure.json";

    // Load settings
    var settings = Object.assign({
		ACC_FMT : 0,
		TEST_MODE : false
	}, require('Storage').readJSON(FILE,1)||{});
  
    function writeSettings() {
      require('Storage').writeJSON(FILE, settings);
      if (WIDGETS["openseizure"]) WIDGETS["openseizure"].reload()
    }
  
    // Show the menu
    const osdMenu = {
      "" : { "title" : "App Name" },
      "< Back" : () => back(),
      'TEST_MODE': {
        value: !!settings.TEST_MODE,  // !! converts undefined to false
        format: v => v?"On":"Off",
        onchange: v => {
          settings.TEST_MODE = v;
          writeSettings();
          E.showMenu(osdMenu);
        }
      },
      'ACC_FMT': {
        value: 0|settings.ACC_FMT,  // 0| converts undefined to 0
        min: 0, max: 3,
        onchange: v => {
          settings.ACC_FMT = v;
          writeSettings();
          E.showMenu(osdMenu);
        }
      },
    };
    E.showMenu(osdMenu);
  })  //(load)