let index = 0;
const numStudio = 3;
const minsPerStudio = 2;

setInterval(function() {
  index++;
  if (index > numStudio - 1) {
    index = 0;
  }
}, 1000 * 60 * minsPerStudio);

// journey setup

const route = [];
const boxSize = 26;

const rResolution = 1.2;
const rSpeed = 0.006;
const rAmplitude = boxSize * boxSize * 3;

let gHue = Math.random() * 360;
const hueSpeed = 0.8;

//children setup
const boxes = [];

//tentacle setup
const NUM_TENTACLES = 16;
const SIZE = 30;
const DENSITY = 19;

const tentacles = [];

//p5 setup
setup = () => {
  createCanvas(800, 600, WEBGL);
  setAttributes("perPixelLighting", true);
  colorMode(HSB);

  // 100 route items
  let length = 60;
  for (let i = 0; i < length; i += 1) {
    route.push(new RouteItem(128 - (i / length) * 128));
  }

  boxes.push(new Box(70));
  boxes.push(new Box(60));
  boxes.push(new Box(50));
  boxes.push(new Box(40));
  boxes.push(new Box(30));
  boxes.push(new Box(20));
  boxes.push(new Box(10));

  for (let i = 0; i < NUM_TENTACLES; i++) {
    tentacles.push(new Tentacle(i / NUM_TENTACLES));
  }
};

draw = () => {
  if (index == 0) {
    journeyDraw();
  } else if (index == 1) {
    childrenDraw();
  } else if (index == 2) {
    tentacleDraw();
  }
};

class RouteItem {
  constructor(radius) {
    this.radius = radius;
    this.cx = 0;
    this.cy = 0;
    this.cz = 0;
  }

  getY() {
    return -this.cy;
  }

  render(i) {
    const { radius } = this;
    this.cx = 0;
    this.cy = noise((frameCount * 0.5 + i * rResolution) * rSpeed) * rAmplitude;
    this.cz = -i * boxSize + 400 + boxSize;
    const angleShift =
      (i / (route.length - 1)) * Math.PI +
      frameCount * 0.015 +
      sin(frameCount * 0.01 + i * 0.1);
    const circum = 2 * Math.PI * radius;

    const numEntities = int(circum / boxSize);
    for (let e = 0; e < numEntities; e += 1) {
      const angle = (e / (numEntities - 1)) * Math.PI * 2 + angleShift;
      const ex = Math.cos(angle) * radius;
      const ey = Math.sin(angle) * radius;
      const ez = sin(frameCount * 0.01 + i * 0.1) * boxSize * 0.7;
      push();
      fill(
        noise((frameCount * 0.05 + i + angle) * 0.4) * 360,
        map(noise(frameCount * 0.05 + i, angle), 0, 1, 64, 100),
        map(noise(angle, frameCount * 0.05 + i), 0, 1, 30, 100)
      );
      translate(this.cx + ex, this.cy + ey, this.cz + ez);
      strokeWeight(2);
      box(boxSize);
      pop();
    }
  }
}

class Box {
  constructor(size) {
    this.size = size;
  }

  render() {
    const sizeColorMod = 0.03 * this.size;
    const colorTheta = frameCount * 0.01;
    const r = (sin(colorTheta + sizeColorMod) * 255) / 2 + 255 / 2;
    const g =
      (sin(colorTheta + (PI * 1) / 3 + sizeColorMod) * 255) / 2 + 255 / 2;
    const b =
      (sin(colorTheta + (PI * 2) / 3 + sizeColorMod) * 255) / 2 + 255 / 2;
    const a = map(this.size, 20, 70, 0, 0.9);
    fill(
      `rgba(${parseInt(r, 10)}, ${parseInt(g, 10)}, ${parseInt(b, 10)}, ${a})`
    );
    strokeWeight(3);
    rotateX(frameCount * 0.005);
    rotateY(frameCount * 0.005);
    box(sin(frameCount * 0.025) * this.size + 3 * this.size);
  }
}

class Tentacle {
  constructor(index) {
    this.props = {
      angle: map(index, 0, 1, 0, TWO_PI),
      rot: Math.random() * SIZE,
      size: int(Math.random() * 30 + 20)
    };
  }

  rotate() {
    this.props.rot += 0.004;
  }

  render() {
    const { angle, rot, size } = this.props;

    const nx = angle * SIZE + rot;

    const xMove = cos(angle) * SIZE;
    const yMove = SIZE;
    const zMove = sin(angle) * SIZE;

    push();
    //first box
    fill("black");
    translate(cos(angle) * SIZE, 0, sin(angle) * SIZE);
    box(SIZE);
    for (let i = 0; i < size - 1; i++) {
      const noiseMove = noise(nx, i) - 0.5;
      const xTrans = xMove + SIZE * noiseMove;
      const yTrans = noiseMove * 0.4 * (yMove + i * i);
      const zTrans = zMove + SIZE * noiseMove;
      const hue = map(sin(frameCount * 0.001 + angle * 5), -1, 1, -0, 360);
      const sat = map(
        Math.abs(xTrans) + Math.abs(yTrans) + Math.abs(zTrans),
        0,
        SIZE * 4,
        0,
        255
      );
      fill(hue, sat, sat);
      translate(xTrans, yTrans, zTrans);
      box(SIZE);
    }
    pop();
  }
}

function journeyDraw() {
  background(255);

  gHue += hueSpeed;
  if (gHue > 360) {
    gHue = 0;
  }

  // look 15 routeitems ahead
  camera(
    0,
    -route[1].getY(),
    400 + boxSize,
    0,
    -route[16].getY(),
    -16 * boxSize + 400 + boxSize,
    0,
    1,
    0
  );

  // render
  for (let i = 0; i < route.length; i += 1) {
    route[i].render(i);
  }
}

function childrenDraw() {
  background(255);

  camera(400, 400, 400, 0, 0, 0, 0, 1, 0);

  for (const box of boxes) {
    box.render();
  }
}

function tentacleDraw() {
  background(255);
  rotateX(0.6);
  camera(400, 400, 400, 0, 0, 0, 0, -1, 0);
  for (const tentacle of tentacles) {
    tentacle.rotate();
    tentacle.render();
  }
}
