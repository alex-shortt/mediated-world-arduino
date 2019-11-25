import processing.serial.*;
import controlP5.*;

SerialSelect serial;
ControlP5 cp5;

void setup() {
  size(700, 500);

  cp5 = new ControlP5(this);
  serial = new SerialSelect(this, cp5, 9600);
}

void draw() {
  background(255);
  int left = int(map(mouseX * 100f / (float) width, 0, 100, 0, 255));
  int top = int(map(mouseY * 100f / (float) height, 0, 100, 0, 255));

  String leftHex = String.format("%02X", left);
  String topHex = String.format("%02X", top);
  String message = "<0" + leftHex + topHex + ">";
  
  serial.write(message);
  serial.render(20, 20);
}
