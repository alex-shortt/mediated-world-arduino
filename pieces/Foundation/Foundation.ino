#include <FastLED.h>

// project data
#define FRAMES_PER_SECOND  120

// Strip C
#define LEN3 60
CRGB leds3[LEN3];

// Strip B
#define LEN5 60
CRGB leds5[LEN5];

// Strip A
#define LEN6 60
CRGB leds6[LEN6];

uint8_t gHue = 0;

// data collection
const byte numChars = 32;
char receivedChars[numChars];
char tempChars[numChars];
boolean newData = false;

// Run Program --------------------------------------------------------

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
        if(c == 6){
          // data format: <001122>
          uint8_t firstVal = getHexAt(tempChars, 1, 2);
          uint8_t secondVal = getHexAt(tempChars, 3, 2);
          uint8_t thirdVal = getHexAt(tempChars, 5, 2);

          for(byte i = 0; i < LEN3; i++){
            leds3[i].setHSV(gHue, 255, 255);
            leds3[i].nscale8_video(firstVal);
          }

          for(byte i = 0; i < LEN5; i++){
            leds5[i].setHSV(gHue + (255 / 3.0), 255, 255);
            leds5[i].nscale8_video(secondVal);
          }

          for(byte i = 0; i < LEN6; i++){
            leds6[i].setHSV(gHue + (255 * 2 / 3.0), 255, 255);
            leds6[i].nscale8_video(thirdVal);
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
