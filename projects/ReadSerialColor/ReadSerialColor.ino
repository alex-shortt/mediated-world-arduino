#include <FastLED.h>

#define NUM_LEDS 60
#define DATA_PIN 6
#define FRAMES_PER_SECOND  120

// color data
CRGB leds[NUM_LEDS];

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
    FastLED.show();  
//    FastLED.delay(1000/FRAMES_PER_SECOND);
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
//        Serial.println(tempChars);
        uint32_t first = getHexAt(tempChars, 1, 2);
        uint32_t last = getHexAt(tempChars, 3, 2);
        uint32_t rgb = getHexAt(tempChars, 5, 6);
        uint32_t alpha = getHexAt(tempChars, 11, 2);
       
//        Serial.println("first: " + String(first));
//        Serial.println("last: " + String(last));
//        Serial.println("rgb: " + String(rgb));
//        Serial.println("alpha: " + String(alpha));

        if(last > 59) last = 59;
        
        for(int i = first; i <= last; i++) {
          leds[i].setColorCode(rgb);
        }

        newData = false;
    }
}

uint32_t getHexAt(char message[], int p, int l) {
    char sub[8] = "0000000";
    substring(tempChars, sub, p, l);
    return (uint32_t) strtol(sub, NULL, 16); 
}

void substring(char s[], char sub[], int p, int l) {
   int c = 0;
   
   while (c < l) {
      sub[c] = s[p+c-1];
      c++;
   }

   sub[c] = '\0';
}
