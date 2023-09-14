const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const content = document.querySelector("#content");

const scanTitle = document.querySelector("#scanner_title");
scanTitle.style.visibility = "hidden";

const scanFooter = document.querySelector("#scanner_footer");
scanFooter.style.visibility = "hidden";

const scanComplete = document.querySelector("#scan_complete");
scanComplete.style.visibility = "hidden";

const scanner = document.getElementById("scanner");
scanner.style.visibility = "hidden";

let scanning = false;

// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

function cameraoff() {
    const stream = videoElem.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
      videoElem.srcObject = null;
   }
}
  
  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will 
  // define in the next step.
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', (e) => {
        enableCam(e);
        content.style.visibility = "hidden";
    });
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
  
  // Placeholder function for next step. Paste over this in the next step.
  // Enable the live webcam view and start classification.
function enableCam(event) {
    // Only continue if the COCO-SSD has finished loading.
    if (!model) {
      return;
    }
    
    // Hide the button once clicked.
    event.target.classList.add('removed');  
    
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
  }

  var children = [];

  function predictWebcam() {
    // Now let's start classifying a frame in the stream.
    model.detect(video).then(function (predictions) {
      // Remove any highlighting we did previous frame.
      for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
      }
      children.splice(0);
    
      // Now lets loop through predictions and draw them to the live view if
      // they have a high confidence score.
      for (let n = 0; n < predictions.length; n++) {
        if (predictions[n].score > 0.85) {
            const p = document.createElement('p');
            p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
            p.style = 'margin-left: ' + (predictions[n].bbox[0]+100) + 'px; margin-top: '
            + (predictions[n].bbox[1] -10) + 'px; width: ' 
            + (predictions[n].bbox[2] -10) + 'px; top: 180px; left: 0;';
            
            const highlighter = document.createElement('div');
            highlighter.setAttribute('class', 'highlighter');
            highlighter.style = 'left: ' + (predictions[n].bbox[0]+100) + 'px; top: '
            + (predictions[n].bbox[1]+180)+ 'px; width: ' 
            + (predictions[n].bbox[2]-10) + 'px; height: '
            + (predictions[n].bbox[3]+80) + 'px;';

            liveView.appendChild(highlighter);
            liveView.appendChild(p);
            children.push(highlighter);
            children.push(p);
            setTimeout(() => {
                video.pause();
                scanner.style.visibility = "visible";
                scanTitle.style.visibility = "visible";
                scanFooter.style.visibility = "visible";
                scanning = true;
                setTimeout(() => {
                  video.remove();
                    scanner.remove();
                    scanTitle.remove();
                    scanFooter.remove();
                    scanComplete.style.visibility = "visible";
                    liveView.remove();
                }, 5000);
            },4000);

            // if(scanning) {
                
            // }
        }
      }
      
      // Call this function again to keep predicting when the browser is ready.
      window.requestAnimationFrame(predictWebcam);
    });
  }

var model = undefined;

cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  demosSection.classList.remove('invisible');
});