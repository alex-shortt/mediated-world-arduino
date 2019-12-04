import processing.serial.*;
import controlP5.*;

SerialSelect serial;
ControlP5 cp5;
KinectBlobHandler kinectBlob;

float kp = 0.124;
float ki = 0.011;
float kd = 0.27;

float maxOutput = 0;

void setup() {
  size(700, 700);

  cp5 = new ControlP5(this);
  serial = new SerialSelect(this, cp5, 9600);
  kinectBlob = new KinectBlobHandler(this);
}

void draw() {
  background(255);
  
  // render serial selector
  serial.render(20, 20);
  
  // update and render kinect and blobs
  image(kinectBlob.getDepthImage(), 70, 130); 
  kinectBlob.update();
  kinectBlob.render(70, 130);
  
  String message = processBlobData(kinectBlob.getBlobs());
  textSize(20);
  fill(color(255, 0, 0));
  text(message, 250, 580);
  serial.write(message);
  
  // kp / ki values
  text("kp: " + kp, 70, 625);
  text("ki: " + ki, 70, 650);
  text("kd: " + kd, 70, 675);
}

// Adjust the angle and the depth threshold min and max
void keyPressed() {
  if (key == 'a') {
    kp += 0.001;
  } else if (key == 'z') {
    kp -= 0.001;
  } else if (key == 's') {
    ki += 0.001;
  } else if (key == 'x') {
    ki -= 0.001;
  } else if (key =='d') {
    kd += 0.001;
  } else if (key =='c') {
    kd -= 0.001;
  }
}

String processBlobData(ArrayList<Blob> blobs){
  if (blobs.isEmpty()){
    return "<0>";
  }
  
  // find the biggeset blob
  Blob biggestBlob = blobs.get(0);
  for(Blob b : blobs) {
    if(b.size() > biggestBlob.size()){
      biggestBlob = b;
    }
  }
  
  // gather variables
  PVector center = biggestBlob.getCenter();
  int kinectWidth = kinectBlob.getWidth();
  int kinectHeight = kinectBlob.getHeight();
  float avgDepth = biggestBlob.getAverageDepth();
  float move = constrain(map(biggestBlob.getMovement(), 10, 60, 0, 100), 0, 100);
  
  // map variables
  int id = biggestBlob.id % 16;
  int x = int(map(center.x, 0, kinectWidth, 0, 255));
  int y = int(map(center.y, 0, kinectHeight, 0, 255));
  int depth = int(map(avgDepth, kinectBlob.MIN_DEPTH, kinectBlob.MAX_DEPTH, 0, 255));
  int movement = int(map(move, 0, 100, 0, 255));
  
  // encode variables
  String idHex = String.format("%01X", id);
  String xHex = String.format("%02X", x);
  String yHex = String.format("%02X", y);
  String depthHex = String.format("%02X", depth);
  String movementHex = String.format("%02X", movement);
  
  int mappedPop = int(map(move, 0, 100, 0, kinectWidth));
  rect(70, 570, mappedPop, 20);
   
  return "<" + idHex + xHex + yHex + depthHex + movementHex + ">";
}
