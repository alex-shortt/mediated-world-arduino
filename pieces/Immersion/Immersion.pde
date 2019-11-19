import processing.serial.*;
import controlP5.*;

SerialSelect serial;
ControlP5 cp5;

void setup() {
  size(700, 500);

  cp5 = new ControlP5(this);
  serial = new SerialSelect(this, cp5, 115200);
}

void draw() {
  background(255);
  int fromLeft = int(mouseX * 100f / (float) width);
  int fromTop = int(mouseY * 100f / (float) height);
  fill(0);
  serial.render(20, 20);
}
