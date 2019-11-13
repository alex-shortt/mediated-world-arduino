var serial;
var portName = "/dev/tty.usbmodem14401";

let strip;

function setup() {
  createCanvas(640, 480);
  // serial.open(portName); // open a serial port
  frameRate(40);
  strip = new LEDStrip(60);
  serial = new SerialSelect();
}

let oldVal = 0;
let sent = false;
function draw() {
  background(255); // black background
  let val = int(map(mouseX, 0, width, 0, 255));
  if (val !== oldVal) {
    if (val > 255) val = 255;
    if (val < 0) val = 0;
    // serial.write(`<${val},000,000>`);
    strip.setRGB(val, 0, 0);
    console.log(`Sent: ${val}, 000, 000`);
    oldVal = val;
  }
  strip.render(30, 30);
  serial.render(20, 420);
}

class SerialSelect {
  constructor() {
    this.serial = new p5.SerialPort();
    this.message = "";
    this.ports = [];
    this.connected = false;
    this.selectPort = createSelect();
    this.button = createButton("Open");
    this.setup();
  }

  setup() {
    const { serial, button } = this;
    serial.on("list", ports => this.updatePorts(ports));
    serial.on("connected", () => this.log("Connected to the server."));
    serial.on("open", () => this.log("The serial port opened."));
    serial.on("data", this.printSerial);
    serial.on("error", () =>
      this.log("Something went wrong with the serial port.")
    );
    serial.on("close", () => this.log("The serial port closed."));
    serial.list();
    this.button.mousePressed(() => this.clickButton());
  }

  updatePorts(ports) {
    if (this.selectPort) {
      this.selectPort.remove();
    }
    this.selectPort = createSelect();
    console.log(ports);
    for (const port of ports) {
      this.selectPort.option(port);
    }
  }

  log(message) {
    this.message = message;
    console.log(message);
  }

  printSerial() {
    var inString = this.serial.readStringUntil("\r\n");
    if (inString.length > 0) {
      console.log(inString);
    }
  }

  clickButton() {
    const { serial, selectPort } = this;
    this.button.mousePressed(() => this.clickButton());
    serial.open(selectPort.value());
  }

  render(x, y) {
    const { selectPort, button, connected, message } = this;

    // bg & label
    fill("black");
    rect(0, y, width, height);
    fill("white");
    textSize(14);
    textStyle(BOLD);
    text("Serial Connection", x + 20, y + 20);

    // port selection
    selectPort.position(x + 60, y + 39);
    button.position(x + 10, y + 40);

    //status
    fill(connected ? "green" : "red");
    ellipse(x + 9, y + 15, 12, 12);

    // message
    fill("white");
    stroke("white");
    rect(x + 300, y, 3, height);
    noStroke()
    textSize(11);
    text(message, x + 325, y + 10, width - (x + 325 + 20));
  }
}

class LEDStrip {
  constructor(numPixels, size = 8) {
    this.numPixels = numPixels;
    this.size = size;
    this.r = 0;
    this.g = 0;
    this.b = 0;
  }

  setRGB(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  render(x, y) {
    const { numPixels, size, r, g, b } = this;
    for (let i = 0; i < numPixels; i++) {
      const xOff = size * i;
      push();
      fill(r, g, b);
      rect(x + xOff, y, size, size);
      pop();
    }
  }
}
