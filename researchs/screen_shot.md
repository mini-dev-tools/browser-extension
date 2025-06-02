# Chrome Extension Screen Capture with Manifest V3: Complete Implementation Guide

Building a Chrome extension with screen capture capability in Manifest V3 requires navigating significant architectural changes from V2, particularly the shift from persistent background pages to service workers. This guide provides everything you need to implement robust screen capture functionality.

## 1. Complete manifest.json Configuration

The manifest configuration must declare appropriate permissions and set up the service worker architecture required for V3:

```json
{
  "manifest_version": 3,
  "name": "Screen Capture Extension",
  "version": "1.0.0",
  "description": "Chrome extension for screen capture functionality",
  "permissions": [
    "activeTab",
    "tabCapture",
    "desktopCapture",
    "storage",
    "offscreen"
  ],
  "host_permissions": [
    "https://*/*",
    "http://*/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Screen Capture"
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["offscreen.html"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

**Key permissions explained:**
- `desktopCapture`: Enables full screen/window capture via chrome.desktopCapture API
- `tabCapture`: Allows recording of specific browser tabs
- `activeTab`: Provides access to the currently active tab
- `offscreen`: Required for DOM operations in V3 (MediaRecorder, etc.)
- `storage`: For saving settings and temporary data

## 2. JavaScript Implementation for Full Screen Capture

### Approach A: Desktop Capture API (Recommended for Full Screen)

**Background Service Worker (background.js):**
```javascript
// Service worker for desktop capture
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Get active tab first - critical for Manifest V3
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      
      // Request desktop capture with proper parameters
      chrome.desktopCapture.chooseDesktopMedia(
        ["screen", "window", "tab"], // Sources available
        activeTab, // Target tab - required in V3
        (streamId) => {
          if (streamId) {
            // Send stream ID to content script
            chrome.tabs.sendMessage(activeTab.id, {
              type: 'START_CAPTURE',
              streamId: streamId
            });
          } else {
            console.error('User cancelled capture or error occurred');
          }
        }
      );
    }
  } catch (error) {
    console.error('Desktop capture error:', error);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_STREAM_ID') {
    handleStreamRequest(sender.tab?.id, sendResponse);
  }
});
```

**Content Script (content.js):**
```javascript
// Content script for handling capture stream
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'START_CAPTURE') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: request.streamId
          }
        },
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: request.streamId
          }
        }
      });
      
      // Start recording
      startRecording(stream);
      sendResponse({ success: true });
      
    } catch (error) {
      console.error('Error starting capture:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
});

function startRecording(stream) {
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  });
  
  const chunks = [];
  
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    downloadRecording(blob);
  };
  
  mediaRecorder.start();
  
  // Stop after 10 seconds (example)
  setTimeout(() => {
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
  }, 10000);
}

function downloadRecording(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `screen-recording-${Date.now()}.webm`;
  a.click();
  URL.revokeObjectURL(url);
}
```

## 3. Background Scripts and Service Workers

### Service Worker with Offscreen Document Pattern

Since service workers cannot access DOM APIs like MediaRecorder, you must use offscreen documents:

**Background Service Worker:**
```javascript
// Setup offscreen document for MediaRecorder access
async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });

  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL('offscreen.html'),
      reasons: ['USER_MEDIA', 'DISPLAY_MEDIA'],
      justification: 'Recording tab content for screen capture functionality'
    });
  }
}

// Tab capture implementation
chrome.action.onClicked.addListener(async (tab) => {
  await setupOffscreenDocument();
  
  // Get stream ID for tab capture
  chrome.tabCapture.getMediaStreamId({
    targetTabId: tab.id
  }, (streamId) => {
    if (streamId) {
      // Send to offscreen document
      chrome.runtime.sendMessage({
        type: 'START_TAB_CAPTURE',
        streamId: streamId,
        target: 'offscreen'
      });
    }
  });
});
```

**Offscreen Document (offscreen.html):**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Offscreen Document</title>
</head>
<body>
  <script src="offscreen.js"></script>
</body>
</html>
```

**Offscreen Script (offscreen.js):**
```javascript
// Handle MediaRecorder operations in offscreen document
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.target === 'offscreen' && request.type === 'START_TAB_CAPTURE') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: request.streamId
          }
        },
        audio: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: request.streamId
          }
        }
      });
      
      // Continue playing audio to user (prevents muting)
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(audioContext.destination);
      
      // Start recording
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Convert to base64 for message passing
        const reader = new FileReader();
        reader.onload = () => {
          chrome.runtime.sendMessage({
            type: 'SAVE_RECORDING',
            data: reader.result,
            target: 'background'
          });
        };
        reader.readAsDataURL(blob);
      };
      
      mediaRecorder.start();
      
    } catch (error) {
      console.error('Tab capture error:', error);
    }
  }
});
```

## 4. User Permissions and Consent Handling

### Permission Strategy

**Install-time permissions:**
```json
{
  "permissions": ["desktopCapture", "activeTab"]
}
```

**Optional permissions for better UX:**
```json
{
  "permissions": ["activeTab", "storage"],
  "optional_permissions": ["desktopCapture"]
}
```

### Runtime Permission Request
```javascript
// Request optional permission when needed
document.getElementById('enable-capture').addEventListener('click', () => {
  chrome.permissions.request({
    permissions: ['desktopCapture']
  }, (granted) => {
    if (granted) {
      // Permission granted, enable capture features
      enableCaptureUI();
    } else {
      // Handle permission denial
      showPermissionDeniedMessage();
    }
  });
});
```

### Consent Flow Implementation
```javascript
// Always show clear UI indicators during capture
const showCaptureIndicator = () => {
  chrome.action.setBadgeText({ text: "REC" });
  chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
};

const hideCaptureIndicator = () => {
  chrome.action.setBadgeText({ text: "" });
};

// Proper error handling for user cancellation
chrome.desktopCapture.chooseDesktopMedia(sources, tab, (streamId) => {
  if (!streamId) {
    console.log('User cancelled screen capture');
    return;
  }
  
  if (chrome.runtime.lastError) {
    console.error('Screen capture error:', chrome.runtime.lastError);
    return;
  }
  
  // User consented - proceed with capture
  showCaptureIndicator();
  startCapture(streamId);
});
```

## 5. Best Practices and Limitations

### Best Practices

**1. Architecture Pattern:**
- Use service workers for API calls and coordination
- Delegate DOM operations to offscreen documents
- Implement robust message passing between contexts

**2. Error Handling:**
```javascript
async function safeCapture(tab) {
  try {
    // Always check for tab parameter
    if (!tab || !tab.id) {
      throw new Error('Valid tab required for capture');
    }
    
    // Check permissions before attempting capture
    const permissions = await chrome.permissions.contains({
      permissions: ['desktopCapture']
    });
    
    if (!permissions) {
      throw new Error('Desktop capture permission not granted');
    }
    
    // Proceed with capture
    initiateCapture(tab);
    
  } catch (error) {
    console.error('Capture error:', error);
    notifyUser(error.message);
  }
}
```

**3. Resource Management:**
```javascript
// Always clean up streams and recordings
function stopAllCapture() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder = null;
  }
  
  hideCaptureIndicator();
}

// Set up proper cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
  stopAllCapture();
});
```

### Current Limitations

**API Availability Matrix:**
| API | Service Worker | Content Script | Popup | Offscreen Document |
|-----|---------------|----------------|-------|-------------------|
| chrome.desktopCapture | ✅ | ❌ | ✅ | ❌ |
| chrome.tabCapture | ✅ | ❌ | ✅ | ❌ |
| navigator.mediaDevices | ❌ | ✅ | ✅ | ✅ |
| MediaRecorder | ❌ | ✅ | ✅ | ✅ |

**Key Limitations:**
1. No silent capture - user must always explicitly select source
2. Service workers cannot access DOM APIs directly
3. Background capture requires offscreen documents
4. Tab capture audio may be muted without AudioContext workaround

## 6. Working Implementation Examples

### Complete Tab Capture with Audio
```javascript
// Popup implementation using getDisplayMedia
async function captureCurrentTab() {
  try {
    // Modern approach using getDisplayMedia
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: 'tab',
        width: { max: 1920 },
        height: { max: 1080 },
        frameRate: { max: 30 }
      },
      audio: true
    });
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });
    
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // Download the recording
      chrome.downloads.download({
        url: url,
        filename: `capture-${Date.now()}.webm`
      });
    };
    
    recorder.start();
    
    // Stop when user stops sharing
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      recorder.stop();
    });
    
  } catch (err) {
    console.error('Capture failed:', err);
  }
}
```

### Messaging Architecture for Complex Scenarios
```javascript
// Centralized message handler
const MessageHandler = {
  sendToOffscreen: (message) => {
    return chrome.runtime.sendMessage({...message, target: 'offscreen'});
  },
  
  sendToBackground: (message) => {
    return chrome.runtime.sendMessage({...message, target: 'background'});
  },
  
  sendToContent: (tabId, message) => {
    return chrome.tabs.sendMessage(tabId, message);
  }
};

// Usage in service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handlers = {
    'START_CAPTURE': handleStartCapture,
    'STOP_CAPTURE': handleStopCapture,
    'SAVE_RECORDING': handleSaveRecording
  };
  
  const handler = handlers[request.type];
  if (handler) {
    handler(request, sender, sendResponse);
    return true; // Keep message channel open
  }
});
```

## 7. Differences from Manifest V2

### Architecture Changes

**Manifest V2:**
```javascript
// Persistent background page
chrome.browserAction.onClicked.addListener(() => {
  chrome.desktopCapture.chooseDesktopMedia(['screen'], (streamId) => {
    // Direct MediaRecorder usage in background
    const recorder = new MediaRecorder(stream);
    recorder.start();
  });
});
```

**Manifest V3:**
```javascript
// Service worker (no DOM access)
chrome.action.onClicked.addListener(async () => {
  const tabs = await chrome.tabs.query({active: true});
  
  chrome.desktopCapture.chooseDesktopMedia(
    ['screen'], 
    tabs[0], // Required tab parameter
    (streamId) => {
      // Must delegate to offscreen document
      MessageHandler.sendToOffscreen({
        type: 'START_RECORDING',
        streamId: streamId
      });
    }
  );
});
```

### Migration Checklist

- ✅ Replace `background.scripts` with `background.service_worker`
- ✅ Move MediaRecorder operations to offscreen documents
- ✅ Add tab parameter to desktopCapture.chooseDesktopMedia
- ✅ Implement message passing for cross-context communication
- ✅ Handle service worker lifecycle (may terminate anytime)
- ✅ Update permission declarations for V3 syntax
- ✅ Test with Chrome 109+ for offscreen API support

### Critical Bug Fixes

**Prevent Chrome crashes:**
```javascript
// WRONG - causes crashes in V3
chrome.desktopCapture.chooseDesktopMedia(["screen"], (streamId) => {});

// CORRECT - always provide tab
chrome.tabs.query({active: true}, (tabs) => {
  chrome.desktopCapture.chooseDesktopMedia(["screen"], tabs[0], (streamId) => {});
});
```

## Conclusion

Implementing screen capture in Manifest V3 requires careful architecture planning around service worker limitations. The key is understanding which APIs are available in each context and properly delegating tasks through message passing. By following these patterns and best practices, you can create robust screen capture functionality that works reliably in the V3 environment while maintaining user privacy and consent requirements.