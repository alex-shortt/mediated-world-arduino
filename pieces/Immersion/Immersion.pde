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
  //text(fromLeft + ", " + fromTop, 30, 30);
  serial.render(20, 20);
}

class SerialSelect {
  PApplet parent;
  Serial serial;
  ControlP5 cp5;
  DropdownList portSelect;
  Button refresh;
  Button toggle;
  int baudrate;
  Textarea console;
  
  SerialSelect(PApplet parent, ControlP5 cp5, int baudrate){
    this.parent = parent;
    this.cp5 = cp5;
    this.baudrate = baudrate;
    
    //cp5 components
    portSelect = cp5.addDropdownList("Ports");
    refresh = cp5.addButton("refresh");
    toggle = cp5.addButton("open/close");
    console = cp5.addTextarea("txt");
     
    //cp5 components setup
    refresh.onRelease(new CallbackListener() {
      public void controlEvent(CallbackEvent theEvent) {
        refreshPortList();
      }
    });
    
    toggle.onRelease(new CallbackListener() {
      public void controlEvent(CallbackEvent theEvent) {
        togglePort();
      }
    });
    
    console.showScrollbar();
    println(console.isScrollable());
    
    // init
    refreshPortList();
  }
  
  boolean isConnected(){
    return serial != null;
  }
  
  void log(String message) {
    console.setText(">" + message + "\n" + console.getText());
    console.showScrollbar();
  }
  
  void refreshPortList(){
    portSelect.clear();
    String ports[] = Serial.list();
    portSelect.addItems(ports);
    log("List refreshed");
  }
  
  void togglePort(){
    if(isConnected()) {
      serial.clear();
      serial.stop();
      serial = null;
      log("Port Closed");
    } else {
      int portIndex = int(portSelect.getValue());
      serial = new Serial(parent, Serial.list()[portIndex], baudrate);
      log("Port opened on port: " + Serial.list()[portIndex]);
    }
  }
  
  void render(int x, int y){
    // bg & label
    fill(0);
    rect(0, y, width, 70);
    fill(255);
    textSize(14);
    text("Serial Connection", x + 20, y + 20);
    
    //status
    fill(isConnected() ? color(0, 255, 0) : color(255, 0, 0));
    ellipse(x + 9, y + 15, 12, 12);

    // port selection
    portSelect.setSize(200,200)
              .setPosition(x, y + 39)
              .setBackgroundColor(color(255))
              .setItemHeight(20)
              .setBarHeight(20);
    
    //refresh and toggle buttons
    refresh.setPosition(x + 250, y + 10)
           .setSize(100, 20);
    toggle.setPosition(x + 250, y + 40)
          .setSize(100, 20);
    
    console.setPosition(x + 400, y + 5)
           .setSize(width - x - x - 400, 70 - 10)
           .setFont(createFont("arial",10))
           .setLineHeight(10)
           .setColor(color(0))
           .setColorBackground(color(255))
           .setScrollActive(color(0));
  }
}
