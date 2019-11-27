let numBoxes = 11;
const zoom = 35;
let boxesX = [];

let song;
let amp;
let fft;
let mic;

let rotBoost = 0;
let spectrum;

function preload() {
  // song = loadSound("aether fell-1.m4a")
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  numBoxes = numBoxes % 2 == 0 ? numBoxes + 1 : numBoxes;
  // song.play()
  mic = new p5.AudioIn(0.8);
  mic.start();
  amp = new p5.Amplitude(0.8);
  fft = new p5.FFT();
  fft.setInput(mic);
  spectrum = fft.analyze();
  colorMode(HSB);

  for (let x = 0; x < numBoxes; x++) {
    boxesX.push([]);
    for (let y = 0; y < numBoxes; y++) {
      boxesX[x].push([]);
      for (let z = 0; z < numBoxes; z++) {
        const pX = x - parseInt(numBoxes / 2);
        const pY = y - parseInt(numBoxes / 2);
        const pZ = z - parseInt(numBoxes / 2);
        boxesX[x][y].push(new Box(pX, pY, pZ, zoom));
      }
    }
  }
}

function draw() {
  background(255);
  let level = mic.getLevel(0.3);
  rotBoost += level * level * 0.001;
  rotateY(frameCount * 0.004 + rotBoost);
  rotateX(frameCount * 0.002 + rotBoost);
  rotateZ(frameCount * 0.001 + rotBoost);
  for (const row of boxesX) {
    for (const column of row) {
      for (const box of column) {
        box.update(spectrum);
        box.render();
      }
    }
  }
  spectrum = fft.analyze();
}

class Box {
  constructor(x, y, z, size) {
    this.size = size;
    this.x = x;
    this.y = y;
    this.z = z;
    this.energy = 0;
    this.deltaEnergy = 0;
  }

  update(spectrum) {
    this.spectrum = spectrum;

    let prevEnergy = this.energy;
    this.energy = this.getRangeEnergy();
    this.deltaEnergy = this.energy - prevEnergy;
  }

  getRangeEnergy() {
    let spectrum = this.spectrum;

    let dist = abs(this.x) + abs(this.y) + abs(this.z);
    let maxDist = parseInt(numBoxes / 2) * 3;

    let size = parseInt(spectrum.length / maxDist);
    let start = parseInt(map(dist / maxDist, 0, 1, 0, spectrum.length - size));

    let maxEnergy = 0;
    let minEnergy = 0;
    let sum = 0;
    for (let i = start; i < start + size; i++) {
      maxEnergy = max(spectrum[i] || 0, maxEnergy);
      minEnergy = min(spectrum[i] || 0, minEnergy);
      sum += spectrum[i] || 0;
    }
    let avg = sum / size;

    return maxEnergy;
  }

  render() {
    push();

    // move
    const spacing = this.size * 1.3 * map(amp.getLevel(), 0, 1, 1, 1.2);
    translate(this.x * spacing, this.y * spacing, this.z * spacing);

    //color
    const energy = map(this.energy, 0, 255, 0, 100);
    const s = 95;
    const v = parseInt(map(energy, 0, 100, 10, 95));
    const sizeColorMod = 0.01 * this.x * this.y * this.z;
    const deltaColorMod = abs(this.deltaEnergy) * 0.04;
    const h = map(sin(frameCount * 0.005 - sizeColorMod - deltaColorMod), -1, 1, 0, 360);
    fill(color(parseInt(h), s, v));
    strokeWeight(2);

    //rotate
    rotateX(map(energy, 0, 100, 0, Math.PI * 2));
    rotateY(map(energy, 0, 100, 0, Math.PI * 2));
    rotateZ(map(energy, 0, 100, 0, Math.PI * 2));

    //draw
    box(this.size * energy * 0.01);
    pop();
  }
}
