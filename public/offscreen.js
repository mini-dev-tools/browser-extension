// Offscreen document for handling MediaRecorder operations
let mediaRecorder = null;
let currentStream = null;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.target === 'offscreen') {
    switch (request.type) {
      case 'START_SCREEN_CAPTURE':
        await startScreenCapture(request.streamId);
        break;
      case 'START_TAB_CAPTURE':
        await startTabCapture(request.streamId);
        break;
      case 'STOP_CAPTURE':
        stopCapture();
        break;
    }
  }
});

async function startScreenCapture(streamId) {
  try {
    console.log('Offscreen: Starting screen capture with streamId:', streamId);
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: streamId
        }
      },
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: streamId
        }
      }
    });
    
    currentStream = stream;
    startRecording(stream, 'screen');
    
  } catch (error) {
    console.error('Offscreen: Screen capture error:', error);
    chrome.runtime.sendMessage({
      type: 'CAPTURE_ERROR',
      target: 'background',
      error: error.message
    });
  }
}

async function startTabCapture(streamId) {
  try {
    console.log('Offscreen: Starting tab capture with streamId:', streamId);
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });
    
    // Keep audio playing to user
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);
    
    currentStream = stream;
    startRecording(stream, 'tab');
    
  } catch (error) {
    console.error('Offscreen: Tab capture error:', error);
    chrome.runtime.sendMessage({
      type: 'CAPTURE_ERROR',
      target: 'background',
      error: error.message
    });
  }
}

function startRecording(stream, captureType) {
  try {
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    const chunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      
      // Convert to base64 for message passing
      const reader = new FileReader();
      reader.onload = () => {
        chrome.runtime.sendMessage({
          type: 'SAVE_RECORDING',
          target: 'background',
          data: reader.result,
          captureType: captureType,
          timestamp: Date.now()
        });
      };
      reader.readAsDataURL(blob);
      
      // Clean up
      cleanup();
    };
    
    mediaRecorder.onerror = (event) => {
      console.error('Offscreen: MediaRecorder error:', event.error);
      chrome.runtime.sendMessage({
        type: 'CAPTURE_ERROR',
        target: 'background',
        error: event.error.message
      });
    };
    
    mediaRecorder.start(1000); // Collect data every second
    
    console.log('Offscreen: Recording started');
    
    // Auto-stop after 5 minutes max
    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        console.log('Offscreen: Auto-stopping recording after 5 minutes');
        stopCapture();
      }
    }, 5 * 60 * 1000);
    
    // Stop when stream ends (user stops sharing)
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      console.log('Offscreen: Stream ended, stopping recording');
      stopCapture();
    });
    
  } catch (error) {
    console.error('Offscreen: Recording start error:', error);
    chrome.runtime.sendMessage({
      type: 'CAPTURE_ERROR',
      target: 'background',
      error: error.message
    });
  }
}

function stopCapture() {
  console.log('Offscreen: Stopping capture');
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  
  cleanup();
}

function cleanup() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  
  mediaRecorder = null;
  
  chrome.runtime.sendMessage({
    type: 'CAPTURE_STOPPED',
    target: 'background'
  });
}