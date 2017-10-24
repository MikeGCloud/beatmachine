var buttonDown = document.createElement("audio");
var buttonUp = document.createElement("audio");
buttonDown.setAttribute("src", "http://slug.god.jp/button-sounds/button-down.wav");
buttonUp.setAttribute("src","http://slug.god.jp/button-sounds/button-up.wav");
buttonDown.setAttribute("preload","auto");
buttonUp.setAttribute("preload","auto");
var BD = document.createElement("audio");
BD.setAttribute("src","./snd_606/bd.wav");
BD.setAttribute("preload","auto");
var SD = document.createElement("audio");
SD.setAttribute("src","./snd_606/sd.wav");
SD.setAttribute("preload","auto");
var CHH = document.createElement("audio");
CHH.setAttribute("src","./snd_606/chh.wav");
CHH.setAttribute("preload","auto");
var OHH = document.createElement("audio");
OHH.setAttribute("src","./snd_606/ohh.wav");
OHH.setAttribute("preload","auto");

function playDrum(sound){
  var drum = '';
  switch (sound) {
    case 0:
    //BD
    drum = BD;
    break;
    case 1:
    //SD
    drum = SD;
    break;
    case 2:
    //CHH
    drum = CHH;
    break;
    case 3:
    //OHH
    drum = OHH;
    break;
  }
  // console.log(sound);
  drum.currentTime = 0;
  drum.play();
}

function setStepButtonState(drum){
  sequence[drum].forEach(function(val,index){
    if(sequence[drum][index] === 1){
      $('.stepbutton[data-step='+index+']').addClass('stepOn');
    }else if(sequence[drum][index] === 0){
      $('.stepbutton[data-step='+index+']').removeClass('stepOn');
    }
  });
}

//refresh rate and bpm setup
// const UPDATE_INTERVAL = 1000 / 60      //1000 milliseconds divided by 50 frames per second = 20ms per frame
var bpm = 102*4;      //tempo in beats per minute. multiplied by 4 for 16th notes.
var beat = 60/bpm;     //length of one beat, in seconds
//delta time setup
var lastUpdate = Date.now();
var timer = 0;
var a = 1;
//sequencer setup
var step = 0;   //current step
var sequenceLength = 16;
//all sequencer steps, has to have 16 steps (16th notes)
//0 = kick, 1 = snare, 2 = chh, 3 = ohh
var sequence = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
//sequencer state
var running = false;
var hasLooped = false;
//selector for current drum, defaults to kick
var currentDrum = 0;



//sequencer loop
setInterval(function(){
  //sets deltatime, time passed since last sequence loop was called
  var time = Date.now();
  var delta = (time - lastUpdate)/1000   // divide by 1000 to convert from milliseconds to seconds
  lastUpdate = time;
  //only add time to delta if the sequencer is running
  if(running){
    timer += delta;
    console.log(delta);
  }
  //one beat has passed (technically the length of a 16th note because of the multiplier in setup)
  if(timer>=beat){
    //increase step counter, reset if all steps are played
    if(step>=sequenceLength){
      step = 0;
      hasLooped = true;
    }
    //plays the corresponding drum if the current step is on. state is sequence, drum is step index.
    sequence.forEach(function(seq, drum){
      if(seq[step] === 1){
        playDrum(drum);
        // console.log(drum);
      }
    });
    //current step light flashing
    var prevStep = step-1;
    if(prevStep < 0 && hasLooped){
      prevStep = 15;
    }

    $('.stepbutton[data-step='+(step)+']').toggleClass('stepOn');
    $('.stepbutton[data-step='+(prevStep)+']').toggleClass('stepOn');
    prevStep = step;
    //if sequencer has looped around, toggle the last step
    if(prevStep === 15 && step === 1){
      $('.stepbutton[data-step='+(15)+']').toggleClass('stepOn');
    }
    //increases step
    step++;
    //resets timer for next sequence step
    timer = 0;
  }
},0);

$(document).ready(function(){

  var bpmfield = $('.bpmfield');
  var runButton = $('.run');


  runButton.on('mousedown',function(){
    //starts sequencer if it's stopped
    if(!running){timer = beat;running = true;}
    //stops sequencer if it's running, also turns off step indicator
    else if(running){
      $('.stepbutton[data-step='+(step-1)+']').toggleClass('stepOn');
      running = false;
      hasLooped = false;
      step = 0;
    }
    $(this).toggleClass('run');
    $(this).toggleClass('stop');
    // playSound(440.00);
  });
  $('.stepbutton').on('mousedown',function(){
    sequence[currentDrum][$(this).data("step")] = 1 - sequence[currentDrum][$(this).data("step")];
    $(this).toggleClass('stepOn');
  });
  $('.drum').on('mousedown',function(){
    $('.drum[data-drum='+currentDrum+']').removeClass('selected-drum');
    currentDrum = $(this).data('drum');
    $(this).addClass('selected-drum');
    setStepButtonState(currentDrum);
    $('.stepbutton[data-step='+(step-1)+']').toggleClass('stepOn');
  })
  $('.drum-click').on('mousedown', function(){
    buttonDown.currentTime = 0;
    buttonDown.play();
  });

  $('.click').on('mousedown', function(){
    buttonDown.currentTime = 0;
    buttonDown.play();
  });
  $('.click').on('mouseup',function(){
    buttonUp.currentTime = 0;
    buttonUp.play();
  });

  $('.bpmfield').on('change', function(){
    var number = $(this).val();
    var max = parseInt($(this).attr('max'));
    var min = parseInt($(this).attr('min'));
    console.log(number);
    //reset value to min or max if value exceeds either
    if(number > max){
      $(this).val(max);
      number = max;
    }else if(number < min){
      $(this).val(min);
      number = min;
    }
    bpm = number*4;
    beat = 60/bpm;
    console.log("bpm: "+bpm/4);
  });

  $('.bpmfield').on('keypress',function(event){
    if(event.which != 8 && event.which != 13){
      if(event.which < 48 || event.which > 57){
        event.preventDefault();
      }
    }
  });



  setStepButtonState(currentDrum);
  $('.bpmfield').val(bpm/4);
});
