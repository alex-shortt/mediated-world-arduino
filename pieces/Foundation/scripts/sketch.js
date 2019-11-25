var serial;
let audio;

let bassGraph;
let midGraph;
let trebleGraph;

function setup() {
  createCanvas(640, 980);
  colorMode(HSB, 255);
  serial = new SerialSelect();
  audio = new AudioSource();
  bassGraph = new Graph("Bass");
  midGraph = new Graph("Mid");
  trebleGraph = new Graph("Treble");
}

function draw() {
  background(255);

  const bassEnergy = audio.getEnergy("bass");
  const midEnergy = audio.getEnergy("mid");
  const highEnergy = audio.getEnergy("treble");

  let h = map(sin(frameCount * 0.002), -1, 1, 0, 255);
  let s = 255;

  let v0 = bassEnergy;
  let v1 = midEnergy;
  let v2 = highEnergy;

  let hexH = paddedDecToHex(int(h));
  let hexS = paddedDecToHex(int(s));

  let hexV0 = paddedDecToHex(int(v0));
  let hexV1 = paddedDecToHex(int(v1));
  let hexV2 = paddedDecToHex(int(v2));

  serial.getSerial().write(`<${hexV0}${hexV2}${hexV0}>`);
  // serial.getSerial().write(`<1${hexH}${hexS}${hexV1}>`);
  // serial.getSerial().write(`<2${hexH}${hexS}${hexV2}>`);

  bassGraph.graphValue(v0);
  midGraph.graphValue(v1);
  trebleGraph.graphValue(v2);

  serial.render(20, 20);
  audio.render(20, 110);
  bassGraph.render(20, 200);
  midGraph.render(20, 300);
  trebleGraph.render(20, 400);
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
      let xPos = map(i, 0, spectrum.length, x + 200, width - x);
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

class Graph {
  // dims: width x 50
  constructor(label = "Untitled Graph", min = 0, max = 255) {
    this.values = new Array(300).fill(0);
    this.min = min;
    this.max = max;
    this.label = label;
  }

  graphValue(val) {
    const { values } = this;

    values.push(val);
    values.shift();
  }

  render(x, y) {
    const { values, label, min, max } = this;

    // bg & label
    push();
    noFill();
    stroke("black");
    strokeWeight(4);
    rect(2, y, width - 4, 80);

    fill("black");
    noStroke();
    textSize(14);
    textStyle(BOLD);
    text(label, x, y + 20);
    pop();

    stroke("black");
    for (let i = 0; i < values.length - 1; i++) {
      let xi = map(i, 0, values.length, x + 200, width - x);
      let yi = map(values[i], min, max, y + 75, y + 5);
      let xf = map(i + 1, 0, values.length, x + 200, width - x);
      let yf = map(values[i + 1], min, max, y + 75, y + 5);
      line(xi, yi, xf, yf);
    }
  }
}
