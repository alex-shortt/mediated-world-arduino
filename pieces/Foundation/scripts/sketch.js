var serial;
let audio;
let ledControl;

let bassGraph;
let midGraph;
let trebleGraph;
let lowMidGraph;
let highMidGraph;

function setup() {
  createCanvas(640, 980);
  colorMode(HSB, 255);

  ledControl = new LEDControl();
  serial = new SerialSelect();
  audio = new AudioSource();

  bassGraph = new Graph("Bass");
  lowMidGraph = new Graph("Low Mid");
  midGraph = new Graph("Mid");
  highMidGraph = new Graph("High Mid");
  trebleGraph = new Graph("Treble");
}

function draw() {
  background(255);

  noStroke();
  fill("black");
  textSize(24);
  textStyle(BOLD);
  text("Foundation", 240, 30);

  const bassEnergy = audio.getEnergy("bass");
  const lowMidEnergy = audio.getEnergy("lowMid");
  const midEnergy = audio.getEnergy("mid");
  const highMidEnergy = audio.getEnergy("highMid");
  const trebleEnergy = audio.getEnergy("treble");

  let h = map(sin(frameCount * 0.002), -1, 1, 0, 255);
  let s = 255;

  let v0 = audio.getEnergy(ledControl.getValue(1));
  let v1 = audio.getEnergy(ledControl.getValue(2));
  let v2 = audio.getEnergy(ledControl.getValue(3));

  let hexH = paddedDecToHex(int(h));
  let hexS = paddedDecToHex(int(s));

  let hexV0 = paddedDecToHex(int(v0));
  let hexV1 = paddedDecToHex(int(v1));
  let hexV2 = paddedDecToHex(int(v2));

  serial.getSerial().write(`<${hexV0}${hexV2}${hexV0}>`);

  bassGraph.graphValue(bassEnergy);
  lowMidGraph.graphValue(lowMidEnergy);
  midGraph.graphValue(midEnergy);
  highMidGraph.graphValue(highMidEnergy);
  trebleGraph.graphValue(trebleEnergy);

  serial.render(20, 60);
  audio.render(20, 150);
  ledControl.render(20, 240);
  bassGraph.render(20, 330);
  lowMidGraph.render(20, 430);
  midGraph.render(20, 530);
  highMidGraph.render(20, 630);
  trebleGraph.render(20, 730);
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

class LEDControl {
  // height of 65
  constructor() {
    this.valueOne = createSelect();
    this.valueTwo = createSelect();
    this.valueThree = createSelect();
    this.setup();
  }

  setup() {
    let options = ["bass", "lowMid", "mid", "highMid", "treble"];
    for (const option of options) {
      this.valueOne.option(option);
      this.valueTwo.option(option);
      this.valueThree.option(option);
    }
  }

  getValue(index) {
    if (index === 1) {
      return this.valueOne.value();
    } else if (index === 2) {
      return this.valueTwo.value();
    } else {
      return this.valueThree.value();
    }
  }

  render(x, y) {
    const { valueOne, valueTwo, valueThree } = this;

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
    text("LED Control", x, y + 20);
    pop();

    fill("black");
    noStroke();
    textSize(12);

    text("One", x + 200 - 5, y + 25);
    valueOne.position(x + 200, y + 42);

    text("Two", x + 300 - 5, y + 25);
    valueTwo.position(x + 300, y + 42);

    text("Three", x + 400 - 5, y + 25);
    valueThree.position(x + 400, y + 42);
  }
}
