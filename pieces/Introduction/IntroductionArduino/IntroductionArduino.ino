#include <FastLED.h>

// project data
#define FRAMES_PER_SECOND  120

// Strip G (Bottom Left)
#define LEN3 60
CRGB leds3[LEN3]; 

// Strip D (Top Left)
#define LEN5 60
CRGB leds5[LEN5]; 

// Strip E (Top Right)
#define LEN6 60
CRGB leds6[LEN6]; 

// Strip F (Bottom Right)
#define LEN9 60
CRGB leds9[LEN9]; 

uint8_t gHue = 0;

// data collection
const byte numChars = 32;
char receivedChars[numChars];
char tempChars[numChars];
boolean newData = false;

void setup() {
  FastLED.addLeds<NEOPIXEL, 3>(leds3, LEN3);
  FastLED.addLeds<NEOPIXEL, 5>(leds5, LEN5);
  FastLED.addLeds<NEOPIXEL, 6>(leds6, LEN6);
  FastLED.addLeds<NEOPIXEL, 9>(leds9, LEN9);
  Serial.begin(9600);
}

void loop() {
    recvWithStartEndMarkers();
    processData();
    FastLED.show();
    FastLED.delay(1000/FRAMES_PER_SECOND);
    EVERY_N_MILLISECONDS( 200 ) { gHue++; }
}

void processData(){
  if (newData == true) {
        strcpy(tempChars, receivedChars);

        byte c = 0;
        while (tempChars[c] != '\0') {
          c++;
        }

        // make sure there's no data loss
        if(c == 1) {
          for(byte i = 0; i < LEN3; i++){
            leds3[i].nscale8(230);
          } 
  
          for(byte i = 0; i < LEN5; i++){
            leds5[i].nscale8(230);
          } 
  
          for(byte i = 0; i < LEN6; i++){
            leds6[i].nscale8(230);
          }

          for(byte i = 0; i < LEN9; i++){
            leds9[i].nscale8(230);
          }
        } else if(c == 9){
          // data format: <IXXYYDDMM>
          // read variables
          uint8_t id = getHexAt(tempChars, 1, 1);
          uint8_t px = getHexAt(tempChars, 2, 2);
          uint8_t py = getHexAt(tempChars, 4, 2);
          uint8_t depth = getHexAt(tempChars, 6, 2);
          uint8_t movement = getHexAt(tempChars, 8, 2);

          // prepare variables
          float x = (float) constrain(px - 128, -128, 128) / 128; // -1 to 1
          float y = (float) constrain(py - 128, -128, 128) / 128; // -1 to 1
          float z = (float) depth / 255; // 0 to 1
          gHue += int(movement / 255);
          uint8_t hue = int(gHue + (id * 1.5) + (x * 3) + (y * 3));
          
          for(byte i = 0; i < LEN3; i++){
            float dist = distToCenter(1, 0.25, 0, x, y, z); // 0 to 1
            float sat = map(dist * 255, 0, 255, 150, 255);
            leds3[i].setHSV(hue, sat, movement * dist * dist + (movement / 32));
          } 
  
          for(byte i = 0; i < LEN5; i++){
            float dist = distToCenter(1, 0.75, 0, x, y, z); // 0 to 1
            float sat = map(dist * 255, 0, 255, 150, 255);
            leds5[i].setHSV(hue, sat, movement * dist * dist + (movement / 32));
          } 
  
          for(byte i = 0; i < LEN6; i++){
            float dist = distToCenter(-1, 0.75, 0, x, y, z); // 0 to 1
            float sat = map(dist * 255, 0, 255, 150, 255);
            leds6[i].setHSV(hue, sat, movement * dist * dist + (movement / 32));
          }

          for(byte i = 0; i < LEN9; i++){
            float dist = distToCenter(-1, 0.25, 0, x, y, z); // 0 to 1
            float sat = map(dist * 255, 0, 255, 150, 255);
            leds9[i].setHSV(hue, sat, movement * dist * dist + (movement / 32));
          }
        }
        
        newData = false;
    }
}

// Data Collection -------------------------------------------------------- 

void recvWithStartEndMarkers() {
    static boolean recvInProgress = false;
    static byte ndx = 0;
    char startMarker = '<';
    char endMarker = '>';
    char rc;

    while (Serial.available() > 0 && newData == false) {
        rc = Serial.read();

        if (recvInProgress == true) {
            if (rc != endMarker) {
                receivedChars[ndx] = rc;
                ndx++;
                if (ndx >= numChars) {
                    ndx = numChars - 1;
                }
            }
            else {
                receivedChars[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                ndx = 0;
                newData = true;
            }
        }

        else if (rc == startMarker) {
            recvInProgress = true;
        }
    }
}

// Misc Functions --------------------------------------------------------

uint8_t getHexAt(char message[], int p, int l) {
    char sub[4] = "000";
    substring(tempChars, sub, p, l);
    return (uint8_t) strtol(sub, NULL, 16);
}

void substring(char s[], char sub[], int p, int l) {
   int c = 0;

   while (c < l) {
      sub[c] = s[p+c-1];
      c++;
   }

   sub[c] = '\0';
}

float distToCenter(float x1, float y1, float z1, float x2, float y2, float z2) {
  float maxDist = 5.6;
  float d = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) +(z2-z1)*(z2-z1);
  return constrain(d / maxDist, 0, 1);
}
