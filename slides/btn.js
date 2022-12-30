javascript: (function () {
  /*  Bluetooth Handling   */
  var bluetoothDevice, bluetoothServer, bluetoothService, bluetoothTX;
  function bluetoothConnect(finishedCb) {
    /*  First, put up a window to choose our device */
    navigator.bluetooth
      .requestDevice({
        filters: [
          { services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] },
        ]
      })
      .then((device) => {
        /*  Now connect to it */
        console.log("Connecting to GATT Server...");
        bluetoothDevice = device;
        return device.gatt.connect();
      })
      .then(function (server) {
        /*  now get the 'UART' bluetooth service, so we can read and write! */
        console.log("Connected");
        bluetoothServer = server;
        return server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
      })
      .then(function (service) {
        /*  get the transmit service */
        bluetoothService = service;
        return bluetoothService.getCharacteristic(
          "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
        );
      })
      .then(function (char) {
        bluetoothTX = char;
        /*  get the receive service (for debugging!) */
        return bluetoothService.getCharacteristic(
          "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
        );
      })
      .then(function (bluetoothRX) {
        /*  respond to changes in the characteristic and write them to the console */
        bluetoothRX.addEventListener(
          "characteristicvaluechanged",
          function (event) {
            var ua = new Uint8Array(event.target.value.buffer);
            var str = "";
            ua.forEach((v) => (str += String.fromCharCode(v)));
            if (str.includes("BTNPRESS")) {
              Reveal.next();
            }
          }
        );
        return bluetoothRX.startNotifications();
      })
      .then(function () {
        console.log("Completed!");
        if (finishedCb) finishedCb();
      });
  }

  function bluetoothWrite(str) {
    if (!bluetoothTX) return;
    var next;
    if (str.length > 20) {
      next = str.substr(20);
      str = str.substr(0, 20);
    }
    var u = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) u[i] = str.charCodeAt(i);
    console.log("Writing ", JSON.stringify(str));
    bluetoothTX.writeValue(u.buffer).then(function () {
      if (next) bluetoothWrite(next);
      else console.log("Written!");
    });
  };
  /*  Initialise - we need something to click to start the Bluetooth connection */
  var modal = document.createElement("div");
  modal.style =
    "position:absolute;top:0px;left:0px;width:100%;height:100%;background:rgba(0,0,0,0.8);color:white;z-index:10000;text-align:center";
  document.body.append(modal);
  modal.onclick = function () {
    document.body.removeChild(modal);
    bluetoothConnect(function () {
      console.log("starting up");
      bluetoothWrite("reset();\n");
      setTimeout(() => {
        bluetoothWrite(`
setWatch(function() {
  Bluetooth.println("BTN"+"PRESS");
}, BTN, {repeat:true}); 
digitalPulse(LED2,1,500);\n`);
      }, 2000);
    });
  };
})();
