var serial; // variable to hold an instance of the serialport library
var portName = "/dev/tty.usbmodem14401"; // fill in your serial port name here
var locH, locV; // location of the circle
var circleColor = 255; // color of the circle

function setup() {
  createCanvas(640, 480); // make canvas
  smooth(); // antialias drawing lines
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on("list", printList); // set a callback function for the serialport list event
  serial.on("connected", serverConnected); // callback for connecting to the server
  serial.on("open", portOpen); // callback for the port opening
  serial.on("data", serialEvent); // callback for when new data arrives
  serial.on("error", serialError); // callback for errors
  serial.on("close", portClose); // callback for the port closing

  serial.list(); // list the serial ports
  serial.open(portName); // open a serial port
  frameRate(40);
}

let oldVal = 0;
let sent = false;
function draw() {
  background(255); // black background
  let val = int(map(mouseX, 0, width, 0, 255));
  if (val !== oldVal) {
    if(val > 255) val = 255
    if (val < 0) val = 0
    text(val, 10, 30);
    serial.write(`<${val},000,000>`);
    console.log(`Sent: ${val}, 000, 000`)
    oldVal = val
  }
}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + " " + portList[i]);
  }
}
function serverConnected() {
  console.log("connected to server.");
}

function portOpen() {
  console.log("the serial port opened.");
}

function serialError(err) {
  console.log("Something went wrong with the serial port. " + err);
}

function portClose() {
  console.log("The serial port closed.");
}

function serialEvent() {
  // read a string from the serial port
  // until you get carriage return and newline:
  var inString = serial.readStringUntil("\r\n");
  //check to see that there's actually a string there:
  if (inString.length > 0) {
    console.log(inString);
  }
}
