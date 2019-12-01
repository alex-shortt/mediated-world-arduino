#include <FastLED.h>

// project data
#define FRAMES_PER_SECOND  120

// Strip C
#define LEN3 59
CRGB leds3[LEN3]; 

// Strip B
#define LEN5 60
CRGB leds5[LEN5]; 

// Strip A
#define LEN6 59
CRGB leds6[LEN6]; 

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
          
        } else if(c == 9){
          // data format: <IXXYYDDMM>
          uint8_t id = getHexAt(tempChars, 1, 1);
          uint8_t x = getHexAt(tempChars, 2, 2);
          uint8_t y = getHexAt(tempChars, 4, 2);
          uint8_t depth = getHexAt(tempChars, 6, 2);
          uint8_t movement = getHexAt(tempChars, 8, 2);

          uint8_t hue = int(gHue + (id * 1.5));
          uint8_t saturation = x;
          uint8_t brightness = movement;
  
          for(byte i = 0; i < LEN3; i++){
            leds3[i].setHSV(hue, saturation, brightness);
          } 
  
          for(byte i = 0; i < LEN5; i++){
            leds5[i].setHSV(hue, saturation, brightness);
          } 
  
          for(byte i = 0; i < LEN6; i++){
            leds6[i].setHSV(hue, saturation, brightness);
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
