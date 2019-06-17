/*
  Hibiscus flowers have bloomed                
  Final project of MAKETHINGS, CT, KAIST, 2019 
  by Youngkyung Choi
*/

var myCapture, // camera
    myVida;    // VIDA

var tracker;      //tranking.js
var faceDetected; //indicator for the face detection

var eye; // the eye display

var synth = []; // beep sound 

var w = 1024;
var h = 768;

var gameStep;

var pixelCal;

/* for sound */
var songStart, songPlay, songComplete, songOut, songWarning, songWatching,
standbyCallback = function() {
  console.info("standby");
  gameStep = 'STANDBY';
  gameStart = false;
  gif_fire01.position(-200,-400);
  gif_fire02.position(-200,-400);
  gif_fire03.position(-200,-400);
  gif_fire04.position(-200,-400);
  gif_fire05.position(-200,-400);
  gif_fire06.position(-200,-400);
  gif_fire07.position(-200,-400);
  gif_fire08.position(-200,-400);
  gif_fire09.position(-200,-400);
  
}  
playCallback = function() {
  console.info("playcallback");
  gameStep = 'PLAY';
}  
completeCallback = function() {
  console.info("complete");
  gameStep = 'COMPLETE';
}  
watchingCallback = function() {
  console.info("wathing");
  gameStep = 'WATCHING';
}
outCallback = function() {
  console.info("out");
  gameStep = 'OUT';
}  

warningCallback = function() {
  console.info("warning");
  gameStep = 'WARNING';
}  

openCallback = function() {
  console.info("open");
  gameStep = 'OPEN';
}  

closeCallback = function() {
  console.info("close");
  gameStep = 'CLOSE';
}  



/* for play the game */
var gameStart;
var gameStep;

var countCurrent;
var countPrevious;
var delta;

var watchTime;

var gif_fire01, gif_fire02, gif_fire03;


function preload() {
  soundFormats('m4a');
  songStart = loadSound('assets/start.m4a');
  //songStart.onended(startCallback);
  songPlay= loadSound('assets/play.m4a');
  //songPlay.onended(playCallback);
  songComplete = loadSound('assets/complete.m4a');
  //songComplete.onended(completeCallback);
  songOut = loadSound('assets/out.m4a');
  //songOut.onended(outCallback);
  songWarning = loadSound('assets/warning.m4a');
  //songWarning.onended(warningCallback);
  //songWatching = loadSound('assets/watching.m4a');
  gif_fire01 = createImg('assets/fire01.gif');
  gif_fire02 = createImg('assets/fire01.gif');
  gif_fire03 = createImg('assets/fire01.gif');
  gif_fire04 = createImg('assets/fire02.gif');
  gif_fire05 = createImg('assets/fire02.gif');
  gif_fire06 = createImg('assets/fire02.gif');
  gif_fire07 = createImg('assets/fire03.gif');
  gif_fire08 = createImg('assets/fire03.gif');
  gif_fire09 = createImg('assets/fire03.gif');

}

function setup() {
  cnv = createCanvas(w, h); 
  cnv.parent('container');
  myCapture = createCapture(VIDEO);
  myCapture.size(w/3, h/3);
  myCapture.elt.setAttribute('playsinline', '');
  myCapture.parent('container');
  //myCapture.hide();
  cnv = createCanvas(w, h); 
  cnv.parent('container');

  tracker = new tracking.ObjectTracker(['face']);
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  
  myCapture.elt.id = 'p5video';
  tracking.track('#p5video', tracker, {
      camera: true
  });
  tracker.on('track', function (event) {
      cnv.clear();
      faceDetected = 0;
      strokeWeight(4);
      stroke(255, 0, 200);
      noFill();
      event.data.forEach(function (r) {
          rect(r.x, r.y, r.width, r.height);
          faceDetected = 1;
      })
  });

  eye = new Eye(400,(w-w/3),height/2);

  songStart.setVolume(0.5);
  songComplete.setVolume(0.5);
  songPlay.setVolume(0.5);
  songOut.setVolume(0.5);
  songWarning.setVolume(0.5);

  gameStart = false;
  gameStep = 'STANDBY';

  countCurrent = 0;
  countPrevious = 0;
  delta = 0;

  watchTime = 0;
  
  button = createButton('fullscreen');
  button.position(0,0);
  button.mousePressed(full);

  pixelDensity(1);

  /*
    VIDA stuff
  */
  myVida = new Vida(); // create the object
  /*
    Turn on the progressive background mode.
  */
  myVida.progressiveBackgroundFlag = true;
  /*
    The value of the feedback for the procedure that calculates the background
    image in progressive mode. The value should be in the range from 0.0 to 1.0
    (float). Typical values of this variable are in the range between ~0.9 and
    ~0.98.
  */
  myVida.imageFilterFeedback = 0.92;
  /*
    The value of the threshold for the procedure that calculates the threshold
    image. The value should be in the range from 0.0 to 1.0 (float).
  */
  myVida.imageFilterThreshold = 0.15;
  /*
    You may need a horizontal image flip when working with the video camera.
    If you need a different kind of mirror, here are the possibilities:
      [your vida object].MIRROR_NONE
      [your vida object].MIRROR_VERTICAL
      [your vida object].MIRROR_HORIZONTAL
      [your vida object].MIRROR_BOTH
    The default value is MIRROR_NONE.
  */
  //myVida.mirror = myVida.MIRROR_HORIZONTAL;
  /*
    In order for VIDA to handle active zones (it doesn't by default), we set
    this flag.
  */
  myVida.handleActiveZonesFlag = true;
  /*
    If you want to change the default sensitivity of active zones, use this
    function. The value (floating point number in the range from 0.0 to 1.0)
    passed to the function determines the movement intensity threshold which
    must be exceeded to trigger the zone (so, higher the parameter value =
    lower the zone sensitivity).
  */
  myVida.setActiveZonesNormFillThreshold(0.02);
  /*
    Let's create several active zones. VIDA uses normalized (in the range from
    0.0 to 1.0) instead of pixel-based. Thanks to this, the position and size
    of the zones are independent of any eventual changes in the captured image
    resolution.
  */
  var padding = 0.07; var n = 5;
  var zoneWidth = 0.1; var zoneHeight = 0.5;
  var hOffset = (1.0 - (n * zoneWidth + (n - 1) * padding)) / 2.0;
  var vOffset = 0.25;
  for(var i = 0; i < n; i++) {
    /*
      addActiveZone function (which, of course, adds active zones to the VIDA
      object) comes in two versions:
        [your vida object].addActiveZone(
          _id, // zone's identifier (integer or string)
          _normX, _normY, _normW, _normH, // normalized (!) rectangle
          _onChangeCallbackFunction // callback function (triggered on change)
        );
      and
        [your vida object].addActiveZone(
          _id, // zone's identifier (integer or string)
          _normX, _normY, _normW, _normH // normalized (!) rectangle
        );
      If we use the first version, we should define the function that will be
      called after the zone status changes. E.g.
        function onActiveZoneChange(_vidaActiveZone) {
          console.log(
            'zone: ' + _vidaActiveZone.id +
            ' status: ' + _vidaActiveZone.isMovementDetectedFlag
          );
        }
      Then the addActiveZone call can look like this:
        [your vida object].addActiveZone(
          'an_id', // id
          0.33, 0.33, 0.33, 0.33, // big square on the center of the image
          onActiveZoneChange // callback function
        );
      Note: It is also worth mentioning here that if you want, you can delete a
            zone (or zones) with a specific identifier (id) at any time. To do
            this, use the removeActiveZone function:
              [your vida object].removeActiveZone(id);
      But this time we just want to create our own function drawing the zones
      and we will check their statuses manually, so we can opt out of defining
      the callback function, and we will use the second, simpler version of the
      addActiveZone function.
    */
    myVida.addActiveZone(
      i,
      hOffset + i * (zoneWidth + padding), vOffset, zoneWidth, zoneHeight,
    );
    /*
      For each active zone, we will also create a separate oscillator that we
      will mute/unmute depending on the state of the zone. We use the standard
      features of the p5.Sound library here: the following code just creates an
      oscillator that generates a sinusoidal waveform and places the oscillator
      in the synth array.
    */
    //var osc = new p5.Oscillator();
    //osc.setType('sine');
    /*
      Let's assume that each subsequent oscillator will play 4 halftones higher
      than the previous one (from the musical point of view, it does not make
      much sense, but it will be enough for the purposes of this example). If
      you do not take care of the music and the calculations below seem unclear
      to you, you can ignore this part or access additional information , e.g.
      here: https://en.wikipedia.org/wiki/MIDI_tuning_standard
    */
    //osc.freq(440.0 * Math.pow(2.0, (60 + (i * 4) - 69.0) / 12.0));
    //osc.amp(0.0); osc.start();
    //synth[i] = osc;
  }

  frameRate(30); // set framerate

  


}

function draw() {
  fill(0);
  noStroke();
  rect(w/3,0,w,h);
  //fill(255);
  //rect(w/3, 5*h/6,w,h);
  

  if(myCapture !== null && myCapture !== undefined) { // safety first
    //background(0, 0, 255);
    /*
      Call VIDA update function, to which we pass the current video frame as a
      parameter. Usually this function is called in the draw loop (once per
      repetition).
    */
    myVida.update(myCapture);
    /*
      Now we can display images: source video (mirrored) and subsequent stages
      of image transformations made by VIDA.
    */
    //image(myVida.currentImage, 0, 240, 320, 240);
    //image(myVida.backgroundImage, 0, 240, 320, 240);
    image(myVida.differenceImage, 0, h/3,w/3,h/3);
    image(myVida.thresholdImage, 0, 2*h/3, w/3, h/3);
    
   
    textSize(30);
    fill(255,0,200);
    textAlign(LEFT,BOTTOM);
    // let's also describe the displayed images
    noStroke(); fill(255, 0, 255);
    text('Face Detection', 0, h/3);
    //text('vida: progressive background image', 340, 20);
    text('Zone Detection', 0, h);
    text('Motion Detection', 0, h*2/3);
    
    /*
      VIDA has two built-in versions of the function drawing active zones:
        [your vida object].drawActiveZones(x, y);
      and
        [your vida object].drawActiveZones(x, y, w, h);
      But we want to create our own drawing function, which at the same time
      will be used for the current handling of zones and reading their statuses
      (we must also remember about controlling the sound).
    */
    // defint size of the drawing
    var temp_drawing_w = width * 1 / 3;  var temp_drawing_h = height / 3; 
    // offset from the upper left corner
    var offset_x = 0; var offset_y = 2*h/3;
    // pixel-based zone's coords
    var temp_x, temp_y, temp_w, temp_h;
    push(); // store current drawing style and font
    translate(offset_x, offset_y); // translate coords
    // set text style and font
    textFont('Helvetica', 10); textAlign(LEFT, BOTTOM); textStyle(NORMAL);
    // let's iterate over all active zones
    for(var i = 0; i < myVida.activeZones.length; i++) {
      /*
        Having access directly to objects that store active zone data, we can
        read or modify the values of individual parameters. Here is a list of
        parameters to which we have access:
          normX, normY, normW, normH - normalized coordinates of the rectangle
        in which active zone is contained (bounding box); you can change these
        parameters if you want to move the zone or change it's size;
          isEnabledFlag - if you want to disable the processing of a given
        active zone without deleting it, this flag will definitely be useful to
        you; if it's value is "true", the zone will be tested, if the variable
        value is "false", the zone will not be tested;
          isMovementDetectedFlag - the value of this flag will be "true"
        if motion is detected within the zone; otherwise, the flag value will
        be "false";
          isChangedFlag - this flag will be set to "true" if the status (value
        of isMovementDetectedFlag) of the zone has changed in the current
        frame; otherwise, the flag value will be "false";
          changedTime, changedFrameCount  - the moment - expressed in
        milliseconds and frames - in which the zone has recently changed it's
        status (value of isMovementDetectedFlag);
          normFillFactor - ratio of the area of the zone in which movement was
        detected to the whole surface of the zone
          normFillThreshold - ratio of the area of the zone in which movement
        was detected to the total area of the zone required to be considered
        that there was a movement detected in the zone; you can modify this
        parameter if you need to be able to set the threshold of the zone
        individually (as opposed to function
        [your vida object].setActiveZonesNormFillThreshold(normVal); 
        which sets the threshold value globally for all zones);
          id - zone identifier (integer or string);
          onChange - a function that will be called when the zone changes status
        (when value of this.isMovementDetectedFlag will be changed); the object
        describing the current zone will be passed to the function as a
        parameter.
      */ 
      // read and convert norm coords to pixel-based
      temp_x = Math.floor(myVida.activeZones[i].normX * temp_drawing_w);
      temp_y = Math.floor(myVida.activeZones[i].normY * temp_drawing_h);
      temp_w = Math.floor(myVida.activeZones[i].normW * temp_drawing_w);
      temp_h = Math.floor(myVida.activeZones[i].normH * temp_drawing_h);
      // draw zone rect (filled if movement detected)
      strokeWeight(1);
      if(myVida.activeZones[i].isEnabledFlag) {
        stroke(255, 0, 255);
        if(myVida.activeZones[i].isMovementDetectedFlag) fill(255, 0, 255, 128);
        else noFill();
      }
      else {
        stroke(255, 0, 255);
        /*
          Theoretically, movement should not be detected within the excluded
          zone, but VIDA is still in the testing phase, so this line will be
          useful for testing purposes.
        */
        if(myVida.activeZones[i].isMovementDetectedFlag) fill(0, 0, 255, 128);
        else noFill();
      }
      rect(temp_x, temp_y, temp_w, temp_h);
      // print id
      noStroke();
      if(myVida.activeZones[i].isEnabledFlag) fill(255, 0, 255);
      else fill(255, 0, 255);
      text(myVida.activeZones[i].id, temp_x, temp_y - 1);
      /*
        Using the isChangedFlag flag is very important if we want to trigger an
        behavior only when the zone has changed status.
      */
      if(myVida.activeZones[i].isChangedFlag) {
        // print zone id and status to console ... 
        // console.log(
        //   'zone: ' + myVida.activeZones[i].id +
        //   ' status: ' + myVida.activeZones[i].isMovementDetectedFlag
        // );
        //... and use this information to control the sound.
        //synth[myVida.activeZones[i].id].amp(
        //  0.1 * myVida.activeZones[i].isMovementDetectedFlag
        //);
      }
    }
    pop(); // restore memorized drawing style and font
  }
  else {
    /*
      If there are problems with the capture device (it's a simple mechanism so
      not every problem with the camera will be detected, but it's better than
      nothing) we will change the background color to alarmistically red.
    */
    //background(255, 0, 0);
  }
  

  loadPixels();
  
  
  countPrevious = countCurrent;
  countCurrent = 0;
  for(var y = 480; y < 720  ; y++) {
    for (var x = 0 ; x < 320 ; x++) {
      var index = (x + y * 960) * 4;
      //pixels[index+0] =255;
      //pixels[index+1] =255;
      //pixels[index+2] =255;
      //pixels[index+3] =255;
      if(pixels[index+0] == 255 &&  pixels[index+1] == 255 && pixels[index+2] == 255 && pixels[index+3] == 255){
          countCurrent ++;

    }
  }
}
  
  
  updatePixels();
  delta = countCurrent - countPrevious;
  fill(255,0,255);
  textSize(15);
  text('Movement : ' + countCurrent,20,h/3 + 40 + 10);
  text('Delta : '+ delta, 20,h/3 + 40 + 30);
  

  stroke(0);
  strokeWeight(5);
  
  if(faceDetected == 1 || countCurrent > 2000) {
    gameStart = true; 
  } else if (faceDetected == 0) {
    
  }
  
  if(gameStart) {
    if(!songStart.isPlaying() && !songPlay.isPlaying() && !songComplete.isPlaying() && !songOut.isPlaying() && !songWarning.isPlaying()) {
      if(gameStep == 'START') {
        songStart.play();
        songStart.onended(playCallback);
      }else if(gameStep == 'PLAY') {
        songPlay.play();
        songPlay.onended(openCallback);
      }else if (gameStep == 'OPEN') {
        eye.display(7,'OPEN',false);

      }else if(gameStep == 'WATCHING') {
        console.info('now watching');
        eye.display(7,'WATCHING',false);
        if(countCurrent > 2000 && delta > 0) {
          console.info("threshold");
          console.info(gameStep);

          gameStep = 'OUT';
          watchTime = 0;
        }
      }else if(gameStep == 'CLOSE') {
        eye.display(7,'CLOSE',false);
      }else if(gameStep == 'OUT') {
        songOut.play();
        songOut.onended(standbyCallback);
      }else if(gameStep == 'STANDBY') {
        gameStep = "START";
      }
    } else if(songStart.isPlaying()) {
      console.info("start"); 
      eye.display(7,'START', false);

    } else if(songPlay.isPlaying()) {
        eye.display(7,'CLOSED',false);
        
    } else if(songOut.isPlaying()) {
      eye.display(7,'OUT', false);
    } else if(songComplete.isPlaying()) {
      eye.display(7,'COMPLETE', false); 
      
    }
  } else if (!gameStart) {
    eye.display(7,'STANDBY',false);

  }
  //stroke(200,0,200);
  //rect(0,0,w,h);
}
 

function full() {
  var fs = fullscreen();
  fullscreen(!fs);
}

 
function touchStarted() {
   if(songPlay.isPlaying() && !songComplete.isPlaying() && !songOut.isPlaying() && !songStart.isPlaying() && !songWarning.isPlaying()) {
      songPlay.stop();
      if(!songComplete.isPlaying()) {
        console.info("complete");
        songComplete.play();
        songComplete.onended(standbyCallback);
      }
    }
}



class Eye {


  constructor(diameter, positionX, positionY) {
    
    this.r = diameter;
    this.x = this.r/2; 
    this.h = 0;
    this.xoffset = positionX - this.x;
    this.yoffset = positionY;
    this.eyeState = false;
    this.right = 0;
    this.left = 0; 

  }

 
  display(weight, state, randomPosition) {
    stroke(255);
    strokeWeight(weight);
    if (randomPosition == true && h == 0) {
      this.xoffset += random(-50,50);
      this.yoffset += random(-50,50);
    }
    switch(state) {
      case 'WATCHING':
      this.h = this.r/4 + 15;
      this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
      this.y = this.radi - this.h; 
      this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
      this.angle = PI/2 - acos(this.test);  
      this.angle_d = this.angle*(180/PI);
      noFill()
      strokeWeight(weight);
      arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
      arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
      strokeWeight(weight/2);
      fill(255,0,200);
      ellipse(this.xoffset+this.x,this.yoffset,(this.r/2)*4/5+random(-10,10),(this.r/2)*4/5+random(-10,10));
      arc(this.xoffset+this.x, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
      this.eyeState = true;
      watchTime++;
      fill(255);
      textSize(70);
      textAlign(CENTER,CENTER);
      text("STOP", 2*w/3, h/6);
      if(watchTime > 50) {
        gameStep = 'CLOSE';
        watchTime = 0;
      }
      //println("case Watching");
      break;

      case 'CLOSED':
      this.h = 10;
      this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
      this.y = this.radi - this.h; 
      this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
      this.angle = PI/2 - acos(this.test);  
      this.angle_d = this.angle*(180/PI);
      //line(this.xoffset,this.yoffset,this.xoffset + this.r/2, this.yoffset);
      //arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
      noFill();
      arc(this.xoffset+this.x, this.yoffset-this.y-15, 2*this.radi, 2*this.radi, this.angle+0.015, PI - this.angle-0.015);
      arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
      this.eyeState = false;
      console.info(this.angle);
      //line(xoffset, yoffset, xoffset+r, yoffset); 
    

      fill(255);
      textSize(70);
      textAlign(CENTER,CENTER);
      text("MOVE", 2*w/3 + random(-5,5), h/6 + random(-5,5));

    
      break;

      case 'STANDBY':
      noFill();  
      if(this.eyeState == false) {
        if( this.h <= this.r/4 ) {
          this.eyeOpen = 0;
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          strokeWeight(weight/2);
          arc(this.xoffset+this.x, this.yoffset, (this.r/2)*4/5, (this.r/2)*4/5, PI-(HALF_PI*this.h*2/this.r), PI+(HALF_PI*this.h*2/this.r));
          arc(this.xoffset+this.x, this.yoffset, (this.r/2)*4/5, (this.r/2)*4/5, -(HALF_PI*this.h*2/this.r), (HALF_PI*this.h*2/this.r));
          this.h += 15;
          
        } else if (this.h > this.r/4) {
          
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          strokeWeight(weight/2);
          
          this.eyeOpen++;
          if (this.eyeOpen < 30) {
            ellipse(this.xoffset+this.x,this.yoffset,(this.r/2)*4/5,(this.r/2)*4/5);
            arc(this.xoffset+this.x, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
          }else if (this.eyeOpen < 60) {
            this.left++;
            ellipse(this.xoffset+this.x-this.left,this.yoffset,(this.r/2)*4/5,(this.r/2)*4/5);
            arc(this.xoffset+this.x-this.left, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
          } else if(this.eyeOpen < 120) {
            this.right++;
            ellipse(this.xoffset+this.x-this.left+this.right,this.yoffset,(this.r/2)*4/5,(this.r/2)*4/5);
            arc(this.xoffset+this.x-this.left+this.right, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
          } else if (this.eyeOpen < 150) {
            this.left++;
            ellipse(this.xoffset+this.x-this.left+this.right,this.yoffset,(this.r/2)*4/5,(this.r/2)*4/5);
            arc(this.xoffset+this.x-this.left+this.right, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
          } else if (this.eyeOpen >= 150) {
            this.eyeState = true;  
          }
           
        }
        
      } else if(this.eyeState == true) {
        if (this.h > 0) {
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          
          this.h -= 15;
        } else if (this.h <= 0) {
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          this.eyeOpen--;
          if (this.eyeOpen <140) {
            this.eyeState = false;
            this.left = 0;
            this.right = 0;
          }       
        }
      }
      break;

      case 'START':
      noFill();  
      if(this.eyeState == false) {
        if( this.h <= this.r/4 ) {
          this.eyeOpen = 0;
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          strokeWeight(weight/2);
          arc(this.xoffset+this.x, this.yoffset, (this.r/2)*4/5, (this.r/2)*4/5, PI-(HALF_PI*this.h*2/this.r), PI+(HALF_PI*this.h*2/this.r));
          arc(this.xoffset+this.x, this.yoffset, (this.r/2)*4/5, (this.r/2)*4/5, -(HALF_PI*this.h*2/this.r), (HALF_PI*this.h*2/this.r));
          this.h += 15;
          
        } else if (this.h > this.r/4) {
          
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          strokeWeight(weight/2);
          
          this.eyeOpen++;
          if (this.eyeOpen < 30) {
            ellipse(this.xoffset+this.x,this.yoffset,(this.r/2)*4/5,(this.r/2)*4/5);
            arc(this.xoffset+this.x, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
          }else if (this.eyeOpen < 60) {
            this.left++;
            ellipse(this.xoffset+this.x-this.left,this.yoffset,(this.r/2)*4/5,(this.r/2)*4/5);
            arc(this.xoffset+this.x-this.left, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
          } else if(this.eyeOpen < 120) {
            this.right++;
            ellipse(this.xoffset+this.x-this.left+this.right,this.yoffset,(this.r/2)*4/5,(this.r/2)*4/5);
            arc(this.xoffset+this.x-this.left+this.right, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
          } else if (this.eyeOpen < 150) {
            this.left++;
            ellipse(this.xoffset+this.x-this.left+this.right,this.yoffset,(this.r/2)*4/5,(this.r/2)*4/5);
            arc(this.xoffset+this.x-this.left+this.right, this.yoffset, this.h*2*6/10, this.h*2*6/10, PI, 3*PI/2);
          } else if (this.eyeOpen >= 150) {
            this.eyeState = true;  
          }
           
        }
        
      } else if(this.eyeState == true) {
        if (this.h > 0) {
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          
          this.h -= 15;
        } else if (this.h <= 0) {
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          this.eyeOpen--;
          if (this.eyeOpen <140) {
            this.eyeState = false;
            this.left = 0;
            this.right = 0;
          }       
        }
      }
      fill(255);
      textSize(70);
      textAlign(CENTER,CENTER);
      text("READY", 2*w/3, h/6);
      break;

      case 'CLOSE':
      if (this.h > 0) {
        this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
        this.y = this.radi - this.h; 
        this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
        this.angle = PI/2 - acos(this.test);  
        this.angle_d = this.angle*(180/PI);
        noFill();
        arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
        arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
        this.h -= 20;
      } else if (this.h < 10) {
        gameStep = 'PLAY';
      }
      break;

      case 'OPEN':
      if( this.h <= this.r/4 ) {
        this.eyeOpen = 0;
        this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
        this.y = this.radi - this.h; 
        this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
        this.angle = PI/2 - acos(this.test);  
        this.angle_d = this.angle*(180/PI);
        noFill();
        arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
        arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
        strokeWeight(weight/2);
        arc(this.xoffset+this.x, this.yoffset, (this.r/2)*4/5, (this.r/2)*4/5, PI-(HALF_PI*this.h*2/this.r), PI+(HALF_PI*this.h*2/this.r));
        arc(this.xoffset+this.x, this.yoffset, (this.r/2)*4/5, (this.r/2)*4/5, -(HALF_PI*this.h*2/this.r), (HALF_PI*this.h*2/this.r));
        this.h += 20;
      } else if (this.h > this.r/4) {
        gameStep = 'WATCHING';
      }
      break;

      case 'OUT':
          this.h = this.r/4 + 15;
          this.radi = (this.x*this.x + this.h*this.h)/(2*this.h); 
          this.y = this.radi - this.h; 
          this.test = (2*this.radi*this.radi - this.r*this.r/4 - this.h*this.h)/(2*this.radi*this.radi);  
          this.angle = PI/2 - acos(this.test);  
          this.angle_d = this.angle*(180/PI);
          noFill()
          strokeWeight(weight);
          arc(this.xoffset+this.x, this.yoffset+this.y, 2*this.radi, 2*this.radi, PI+this.angle, TWO_PI - this.angle);
          arc(this.xoffset+this.x, this.yoffset-this.y, 2*this.radi, 2*this.radi, this.angle, PI - this.angle);
          strokeWeight(weight/2);
          
          fill(255,0,255);
          noStroke();
          rect(this.xoffset+this.x-50,this.yoffset, 100,50);
          arc(this.xoffset+this.x,this.yoffset+50,100,100,0,PI);
          stroke(255);
          strokeWeight(7);
          line(this.xoffset+this.x-100,this.yoffset,this.xoffset+this.x + 100,this.yoffset);
          line(this.xoffset+this.x,this.yoffset+30,this.xoffset+this.x,this.yoffset+70);
          line(this.xoffset+this.x -100,this.yoffset,this.xoffset+this.x + 100,this.yoffset);
          fill(255);
          textSize(70);
          textAlign(CENTER,CENTER);
          text("YOU LOSE", 2*w/3, h/6);
          
          break;
          

          case 'COMPLETE' :
              gif_fire01.position(random(400,800),random(100,500));
              gif_fire02.position(random(400,800),random(100,500));
              gif_fire03.position(random(400,800),random(100,500));
              gif_fire04.position(random(400,800),random(100,500));
              gif_fire05.position(random(400,800),random(100,500));
              gif_fire06.position(random(400,800),random(100,500));
              gif_fire07.position(random(400,800),random(100,500));
              gif_fire08.position(random(400,800),random(100,500));
              gif_fire09.position(random(400,800),random(100,500));
              fill(255);
               textSize(70);
               textAlign(CENTER,CENTER);
               text("YOU WIN", 2*w/3, h/6);
          break;
          

    }
  }
}






   