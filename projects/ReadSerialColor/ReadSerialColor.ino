#include <FastLED.h>

#define NUM_LEDS 60
#define DATA_PIN 6
#define FRAMES_PER_SECOND  120



// color data
CRGB leds[NUM_LEDS];
uint8_t red, green, blue;

// serial collection data
const byte numChars = 32;
char receivedChars[numChars];
char tempChars[numChars];
boolean newData = false;

void setup() {
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  Serial.begin(9600);
}


void loop() {
    recvWithStartEndMarkers();
    processData();
    updateStrip();
    FastLED.show();  
    FastLED.delay(1000/FRAMES_PER_SECOND);
}


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

void processData(){
  if (newData == true) {
        strcpy(tempChars, receivedChars);

        char * strtokIndx; // this is used by strtok() as an index

        strtokIndx = strtok(tempChars,",");      
        red = (uint8_t) atoi(strtokIndx);
        strtokIndx = strtok(NULL, ","); 
        green = (uint8_t) atoi(strtokIndx);    
        strtokIndx = strtok(NULL, ",");
        blue = (uint8_t) atoi(strtokIndx);
            
        newData = false;
    }
}

void updateStrip() { 
  for( int i = 0; i < NUM_LEDS; i++) {
    leds[i].setRGB(red, green, blue);
  }
}
