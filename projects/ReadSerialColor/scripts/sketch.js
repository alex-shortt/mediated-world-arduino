var serial;
let strip;
let audio;
let oldVal = 0;

function setup() {
  createCanvas(640, 980);
  strip = new LEDStrip(60, "Strip 1");
  serial = new SerialSelect();
  audio = new AudioSource("Nohidea - Forgive Me", "assets/forgiveme.mp3");
}

function draw() {
  background(255);

  const spectrum = audio.getSpectrum();
  // let segmentSize = int(spectrum.length / 60);
  let avg = 0;
  for (let i = 0; i < spectrum.length; i++) {
    avg += spectrum[i];
  }
  avg /= spectrum.length;
  avg = int(avg);
  strip.setRangeRGB(0, 60, avg, 0, 255 - avg);
  serial.getSerial().write(`<${avg}, 0, ${255 - avg}>`);

  serial.render(20, 20);
  strip.render(20, 120);
  audio.render(20, 200);
}

class AudioSource {
  constructor(label, file) {
    this.file = file;
    this.label = label;
    this.fft = new p5.FFT();
    this.playing = false;
    this.sound = loadSound(file);
    this.button = createButton("Play");
    this.setup();
  }

  setup() {
    const { button } = this;
    button.mousePressed(() => this.clickButton());
  }

  clickButton() {
    const { sound, playing } = this;
    if (playing) {
      sound.pause();
    } else {
      sound.loop();
    }
    this.playing = !playing;
    this.button.remove();
    this.button = createButton(!playing ? "Pause" : "Play");
    this.button.mousePressed(() => this.clickButton());
  }

  getSpectrum() {
    return this.fft.analyze();
  }

  render(x, y) {
    const { label, button, file, fft } = this;

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

    // play / pause
    button.position(x + 10, y + 40);

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
    serial.on("data", this.printSerial);
    serial.on("error", () =>
      this.log("Something went wrong with the serial port.")
    );
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
    console.log(selectPort.value());
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
  constructor(numPixels, label = "Untitled Strip", size = 10) {
    this.label = label;
    this.numPixels = numPixels;
    this.size = size;
    this.leds = new Array(numPixels).fill({ r: 0, g: 0, b: 0 });
  }

  setRangeRGB(first, last, r, g, b) {
    for (let i = first; i <= last; i++) {
      this.leds[i] = { r, g, b };
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
      fill(leds[i].r, leds[i].g, leds[i].b);
      rect(x + xOff, y + 29, size, size);
      pop();
    }
  }
}
