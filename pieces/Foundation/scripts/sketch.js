var serial;
let strip;
let audio;

function setup() {
  createCanvas(640, 980);
  colorMode(HSB, 255);
  strip = new LEDStrip(60, "Strip 1");
  serial = new SerialSelect();
  audio = new AudioSource();
}

function draw() {
  background(255);

  const bassEnergy = audio.getEnergy("bass");
  const midEnergy = audio.getEnergy("mid");
  const highEnergy = audio.getEnergy("treble");

  let h = map(sin(frameCount * 0.002), -1, 1, 0, 255);
  let s = 255;
  let v = highEnergy;

  strip.setHSV(h, s, v);

  let hexStripIndex = paddedDecToHex(0, 1)
  let hexH = paddedDecToHex(int(h))
  let hexS = paddedDecToHex(int(s))
  let hexV = paddedDecToHex(int(v))

  const message = `<${hexStripIndex}${hexH}${hexS}${hexV}>`;
  serial.getSerial().write(message);

  serial.render(20, 20);
  strip.render(20, 120);
  audio.render(20, 200);
}

function paddedDecToHex(val, numPad = 2) {
  return ("000000000000000" + val.toString(16)).substr(-numPad);
}

class AudioSource {
  constructor(label = "Microphone Input") {
    this.mic = new p5.AudioIn(0.8);
    this.label = label;
    this.fft = new p5.FFT();
    this.playing = false;
    this.setup();
  }

  setup() {
    const { mic, fft } = this;
    mic.start();
    fft.setInput(mic);
  }

  getEnergy(arg) {
    return this.fft.getEnergy(arg);
  }

  render(x, y) {
    const { label, file, fft } = this;

    // bg & label
    push();
    noFill();
    stroke("black");
    strokeWeight(4);
    rect(2, y, width - 4, 65);

    fill("black");
    noStroke();
    textSize(14);
    textStyle(BOLD);
    text(label, x, y + 20);
    pop();

    //spectrum
    let spectrum = fft.analyze();
    fill("black");
    for (let i = 0; i < spectrum.length; i++) {
      let xPos = map(i, 0, spectrum.length, x + 200, width - 20);
      let h = map(spectrum[i], 0, 255, 0, -35);
      rect(xPos, y + 60, (width - x - 200 - 20) / spectrum.length, h);
    }
  }
}

class SerialSelect {
  // dims: width x 75
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
    serial.on("open", () => {
      this.log("The serial port opened.");
      this.connected = true;
    });
    serial.on("data", () => this.printSerial());
    serial.on("error", () => {
      this.log("Something went wrong with the serial port.");
      this.connected = false;
    });
    serial.on("close", () => {
      this.log("The serial port closed.");
      this.connected = false;
    });
    serial.list();
    this.button.mousePressed(() => this.clickButton());
  }

  updatePorts(ports) {
    if (this.selectPort) {
      this.selectPort.remove();
    }
    this.selectPort = createSelect();
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
    console.log("Connecting to:", selectPort.value());
    serial.open(selectPort.value());
  }

  getSerial() {
    return this.serial;
  }

  render(x, y) {
    const { selectPort, button, connected, message } = this;

    // bg & label
    fill("black");
    rect(0, y, width, 70);
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
    rect(x + 300, y, 3, 70);
    noStroke();
    textSize(11);
    text(message, x + 325, y + 10, width - (x + 325 + 20));
  }
}

class LEDStrip {
  // dims: width x 50
  // make sure color mode is set to hsb
  constructor(numPixels, label = "Untitled Strip", size = 10) {
    this.label = label;
    this.numPixels = numPixels;
    this.size = size;
    this.leds = new Array(numPixels).fill({ h: 0, s: 0, v: 0 });
  }

  setHSV(h, s, v) {
    const { numPixels } = this

    for (let i = 0; i <= numPixels; i++) {
      this.leds[i] = { h, s, v };
    }
  }

  render(x, y) {
    const { numPixels, size, leds, label } = this;

    // bg & label
    push();
    noFill();
    stroke("black");
    strokeWeight(4);
    rect(2, y, width - 4, 50);

    fill("black");
    noStroke();
    textSize(14);
    textStyle(BOLD);
    text(label, x, y + 20);
    pop();

    for (let i = 0; i < numPixels; i++) {
      const xOff = size * i;
      push();
      stroke("white");
      fill(leds[i].h, leds[i].s, leds[i].v);
      rect(x + xOff, y + 29, size, size);
      pop();
    }
  }
}
