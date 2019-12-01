import java.util.*; 

class Blob {
  float minx;
  float miny;
  float maxx;
  float maxy;
      
  ArrayList<PVector> points;
  int id = 0;
  
  MiniPID miniPID; 
  float movedTarget = 0;
  float movedActual = 0;
  PVector center;
  
  float maxShift = 0;
  
  boolean taken = false;

  Blob(float x, float y, float z) {
    minx = x;
    miny = y;
    maxx = x;
    maxy = y;
    
    points = new ArrayList<PVector>();
    points.add(new PVector(x, y, z));
    center = this.getCenter();
    
    miniPID = new MiniPID(kp, ki, kd);
    miniPID.setOutputLimits(0, 100);
    miniPID.setSetpointRange(50);
    miniPID.setOutputFilter(0.9);
  }
    
  void show(int x, int y) {
    push();
    translate(x, y);
    stroke(0);
    fill(255, 100);
    strokeWeight(2);
    rectMode(CORNERS);
    rect(minx, miny, maxx, maxy);
    
    textAlign(CENTER);
    textSize(64);
    fill(0);
    text(id, minx + (maxx-minx)*0.5, maxy - 10);
    pop();
  }


  void add(float x, float y, float z) {
    points.add(new PVector(x, y, z));
    minx = min(minx, x);
    miny = min(miny, y);
    maxx = max(maxx, x);
    maxy = max(maxy, y);
    center = this.getCenter();
  }
  
  void become(Blob other) {
    push();
    strokeWeight(10);
    stroke(color(255, 0, 0));
    line(center.x + 70, center.y + 130, other.center.x + 70, other.center.y + 130);
    pop();
    
    float boundsShift = abs(other.minx - minx) + abs(other.miny - miny) + abs(other.maxx - maxx) + abs(other.maxy - maxy);
    movedTarget += pow(boundsShift, 0.33) * 20; //<>//
    center = other.center;
    
    if(boundsShift > maxShift) {
      maxShift = boundsShift;
      println("max: " + boundsShift + ", or" +  pow(boundsShift, 0.33) * 10);
    }
    
    minx = other.minx;
    maxx = other.maxx;
    miny = other.miny;
    maxy = other.maxy;
  
    points = other.points;
  }

  float size() {
    return (maxx-minx)*(maxy-miny);
  }
  
  float numPoints(){
    return points.size();
  }
  
  PVector getCenter() {
    float x = (maxx - minx)* 0.5 + minx;
    float y = (maxy - miny)* 0.5 + miny;    
    return new PVector(x,y); 
  }
  
  float getMovement(){
    miniPID.setP((double) kp);
    miniPID.setI((double) ki);
    miniPID.setD((double) kd);
    double output = miniPID.getOutput(movedActual, movedTarget);
    movedActual += output;
    return (float) output;
  }

  boolean isNear(float x, float y, int threshold) {
    float cx = max(min(x, maxx), minx);
    float cy = max(min(y, maxy), miny);
    float d = distSq(cx, cy, x, y);

    if (d < threshold * threshold) {
      return true;
    } else {
      return false;
    }
  }
  
  float getAverageDepth() {
    float sum = 0;
    for(PVector point : points){
      sum += point.z;
    }
    return sum / points.size();
  }
}

float distSq(float x1, float y1, float x2, float y2) {
  float d = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
  return d;
}


float distSq(float x1, float y1, float z1, float x2, float y2, float z2) {
  float d = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) +(z2-z1)*(z2-z1);
  return d;
}
