import processing.serial.*;
import controlP5.*;

SerialSelect serial;
ControlP5 cp5;
KinectBlobHandler kinectBlob;

void setup() {
  size(700, 600);

  cp5 = new ControlP5(this);
  serial = new SerialSelect(this, cp5, 9600);
  kinectBlob = new KinectBlobHandler(this);
}

void draw() {
  background(255);
  int left = int(map(mouseX * 100f / (float) width, 0, 100, 0, 255));
  int top = int(map(mouseY * 100f / (float) height, 0, 100, 0, 255));

  String leftHex = String.format("%02X", left);
  String topHex = String.format("%02X", top);
  String message = "<0" + leftHex + topHex + ">";
  
  kinectBlob.update();
  image(kinectBlob.getDepthImage(), 70, 130); 
  kinectBlob.render(70, 130);
  
  //serial.write(message);
  serial.render(20, 20);
}
