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
        
        // data format: <NHHSSVV>
        uint8_t stripIndex = (uint8_t) getHexAt(tempChars, 1, 1);
        uint8_t hue = getHexAt(tempChars, 2, 2);
        uint8_t saturation = getHexAt(tempChars, 4, 2);
        uint8_t value = getHexAt(tempChars, 6, 2);

        Serial.println("strip index: " + String(stripIndex));
        Serial.println("hue: " + String(hue));
        Serial.println("saturation: " + String(saturation));
        Serial.println("value: " + String(value));

        if(stripIndex >= 0 && stripIndex < NUM_STRIPS){
          for(uint8_t i = 0; i < NUM_LEDS_PER_STRIP; i++){
            leds[stripIndex][i].setHSV(hue, saturation, value);  
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
