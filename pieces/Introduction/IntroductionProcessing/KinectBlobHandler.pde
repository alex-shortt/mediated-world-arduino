import org.openkinect.processing.*;

class KinectBlobHandler {
  Kinect2 kinect2;
  int MAX_DEPTH = 1500; //1500
  int MIN_DEPTH = 300;
  
  int blobCounter = 0;
  ArrayList<Blob> blobs;
  ArrayList<Blob> tempBlobs;
  int DEPTH_THRESHOLD = 20;
  
  PImage img;
  
  public KinectBlobHandler(PApplet parent) {
    kinect2 = new Kinect2(parent);
    kinect2.initDepth();
    kinect2.initDevice();
    
    blobs = new ArrayList<Blob>();
    tempBlobs = new ArrayList<Blob>();
    
    img = createImage(kinect2.depthWidth, kinect2.depthHeight, RGB);
  } 
  
  PImage getDepthImage(){
    return img;
  }
  
  ArrayList<Blob> getBlobs(){
    return blobs;
  }
  
  int getHeight(){
    return kinect2.depthHeight;
  }
  
  int getWidth(){
    return kinect2.depthWidth;
  }
  
  void render(int x, int y){
    // only render biggest blob
    if(blobs.size() > 0) {
      Blob biggestBlob = blobs.get(0);
      for (Blob b : blobs) {
        if(b.size() > biggestBlob.size()){
          biggestBlob = b;
        }
      } 
      biggestBlob.show(x, y);
     }
    
    // render all blobs
    //for (Blob b : blobs) {
    //  b.show(x, y);
    //} 
  }
  
  void update(){
    tempBlobs.clear();
    img.loadPixels();
    
    processFrame();
    processBlobs();
     
    img.updatePixels();   
  }
  
  private void processFrame(){
    int[] depth = kinect2.getRawDepth();
    
    // update img with depth image
    // create blobs
    for (int x = 0; x < kinect2.depthWidth; x++) {
      for (int y = 0; y < kinect2.depthHeight; y++) {
        int offset = x + y * kinect2.depthWidth;
        int d = depth[offset];
      
        if(d > MIN_DEPTH && d < MAX_DEPTH){
          img.pixels[offset] = color(255, 0);
          boolean found = false;
          for (Blob b : tempBlobs) {
            if (b.isNear(x, y, DEPTH_THRESHOLD)) {
              b.add(x, y, d);
              found = true;
              break;
            }
          }
  
          if (!found) {
            Blob b = new Blob(x, y, d);
            tempBlobs.add(b);
          }
        } else {
          img.pixels[offset] = 0;  
        }
        
      }
    }
    
    // remove small blobs
     for (int i = tempBlobs.size()-1; i >= 0; i--) {
      if (tempBlobs.get(i).numPoints() < 1000) {
        tempBlobs.remove(i);
      }
    }
  }
  
  private void processBlobs(){
    if (blobs.isEmpty() && tempBlobs.size() > 0) {
      // no current blobs
      createNewBlobs();
    } else {
      for (Blob b : blobs) {
        b.taken = false;
      }
      
      // Match whatever blobs you can match
      for (Blob b : blobs) {
        float recordD = 1000;
        Blob matched = null;
        for (Blob cb : tempBlobs) {
          PVector centerB = b.getCenter();
          PVector centerCB = cb.getCenter();         
          float d = PVector.dist(centerB, centerCB);
          if (d < recordD && !cb.taken) {
            recordD = d; 
            matched = cb;
          }
        }
        if (matched != null) {
          matched.taken = true;
          b.become(matched);
          b.taken = true;
        }
      }
      
      // remove unmatched blobs
      for (int i = blobs.size() - 1; i >= 0; i--) {
        Blob b = blobs.get(i);
        if (!b.taken) {
          blobs.remove(i);
        }
      }
      
      createNewBlobs();  
  }
}
  
  private void createNewBlobs(){
    // turn all tempBlobs into new blobs
    for (Blob b : tempBlobs) {
      if (!b.taken) {
        b.id = blobCounter;
        blobs.add(b);
        blobCounter++;
      }
    }
  }
}
