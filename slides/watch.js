javascript: (function () {
  function changed(data) {
    console.log("Changed!", value);
    bluetoothWrite(`;E.emit('myapp',${JSON.stringify(data)});\n`);
  }

  let lastSlide, cango;
  function poll() {
    slide = window.location.hash.substring(2);
    if (cango && slide !== lastSlide) {
      lastSlide = slide;
      changed(slide);
    }
  }

  /*  Bluetooth Handling   */
  var bluetoothDevice, bluetoothServer, bluetoothService, bluetoothTX;
  function bluetoothConnect(finishedCb) {
    /*  First, put up a window to choose our device */
    navigator.bluetooth
      .requestDevice({
        filters: [
          { services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] },
          { namePrefix: "Bangle.js" },
        ],
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
            console.log("BT> ",cango, JSON.stringify(str));
            if(!cango) {return;};
            if (str.includes("BTN") || str.includes("NEXT")) {
              Reveal.next();
            }
            if (str.includes("PREV")) {
              Reveal.prev();
            }
          }
        );
        return bluetoothRX.startNotifications();
      })
      .then(function () {
        console.log("Completed!");
        if (finishedCb) finishedCb();
        setInterval(poll, 1000);
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
  }
  /*  Send to Espruino */
  function changed(value) {
    bluetoothWrite(`E.emit('myapp',${JSON.stringify(value)})\n`);
  }
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
var value = "---";

function draw() {
  var R = Bangle.appRect;
  g.reset().clearRect(R);
  g.setFont("Vector",26).setFontAlign(0,0);
  g.drawString(value, R.x + R.w/2, R.y + R.h/2);
  g.setFont("12x20").drawString("slide", R.x + R.w/2, R.y + R.h/2 - 30);
}

Bangle.loadWidgets();
Bangle.drawWidgets();
draw();

E.on('myapp', function(v) {
  value = v;
  Bangle.buzz(300,0.5);
  draw();
});

setWatch(function() {
  Bluetooth.println("BTN");
}, BTN, {repeat:true});

Bangle.on('swipe', function(directionLR, directionUD) { 
  if(directionLR > 0) {
      Bluetooth.println("NEXT");
  }
  if(directionLR < 0) {
      Bluetooth.println("PREV");
  }
});

            `);

        cango = 1;
      }, 2000);
    });
  };
})();
