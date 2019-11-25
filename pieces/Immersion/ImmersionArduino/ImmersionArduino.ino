#include <FastLED.h>

// project data
#define FRAMES_PER_SECOND  120

// led strips data
#define NUM_STRIPS 1
#define NUM_LEDS_PER_STRIP 60
CRGB leds[NUM_STRIPS][NUM_LEDS_PER_STRIP];

// data collection
const byte numChars = 32;
char receivedChars[numChars];
char tempChars[numChars];
boolean newData = false;

// blob data
const uint8_t LED_DIST = 5;

void setup() {
  FastLED.addLeds<NEOPIXEL, 6>(leds[0], NUM_LEDS_PER_STRIP);
  Serial.begin(9600);
}

void loop() {
    recvWithStartEndMarkers();
    processData();
    FastLED.show();
    FastLED.delay(1000/FRAMES_PER_SECOND);
}

void processData(){
  if (newData == true) {
        strcpy(tempChars, receivedChars);

        // data format: <ILLDD>
        uint8_t blobId = getHexAt(tempChars, 1, 1);
        uint8_t left = getHexAt(tempChars, 2, 2);
        uint8_t depth = getHexAt(tempChars, 4, 2);

//        Serial.println("blob id: " + String(blobId));
//        Serial.println("left: " + String(left));
//        Serial.println("depth: " + String(depth));

        uint8_t hue = (uint8_t) map(sin(millis() * 0.01), -1, 1, 0, 255);
    
//        for(uint8_t i = 0; i < NUM_LEDS_PER_STRIP; i++){
//          leds[0][i].setHSV(0, 0, 0);
//        }    


        uint8_t centerLED = (uint8_t) map(left, 0, 255, 0, 60);
        for(uint8_t i = 0; i < NUM_LEDS_PER_STRIP; i++){
          uint8_t thisHue = (hue - blobId) % 255;
          uint8_t saturation = depth;
          uint8_t value;

          uint8_t ledDist = abs(centerLED - i);
          if(ledDist > LED_DIST){
            value = 0;
          } else {
            value = (uint8_t) map(ledDist, 0, LED_DIST, 255, 0);
          }
          leds[0][i].setHSV(thisHue, saturation, value);
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
