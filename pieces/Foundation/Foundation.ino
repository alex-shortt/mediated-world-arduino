#define FASTLED_ALLOW_INTERRUPTS 0
#include <FastLED.h>

// project data
#define FRAMES_PER_SECOND  120

// led strips data
#define NUM_STRIPS 3
#define NUM_LEDS_PER_STRIP 60
CRGB leds[NUM_STRIPS][NUM_LEDS_PER_STRIP];
uint8_t gHue = 0;

// data collection
const byte numChars = 32;
char receivedChars[numChars];
char tempChars[numChars];
boolean newData = false;

void setup() {
  FastLED.addLeds<NEOPIXEL, 3>(leds[0], NUM_LEDS_PER_STRIP);
  FastLED.addLeds<NEOPIXEL, 5>(leds[1], NUM_LEDS_PER_STRIP);
  FastLED.addLeds<NEOPIXEL, 6>(leds[2], NUM_LEDS_PER_STRIP);
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
        
        // data format: <001122>
        uint8_t firstVal = getHexAt(tempChars, 1, 2);
        uint8_t secondVal = getHexAt(tempChars, 3, 2);
        uint8_t thirdVal = getHexAt(tempChars, 5, 2);

        for(byte i = 0; i < NUM_LEDS_PER_STRIP; i++){
          leds[0][i].setHSV(gHue, 255, 255);
          leds[0][i].nscale8_video(firstVal);

          leds[1][i].setHSV(gHue, 255, 255);  
          leds[1][i].nscale8_video(secondVal);

          leds[2][i].setHSV(gHue, 255, 255);  
          leds[2][i].nscale8_video(thirdVal); 
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
