// Background service worker for Manifest V3 screen capture
console.log('Background service worker started');

// Track capture state
let isCapturing = false;
let currentRecordingType = null; // 'screen' or 'tab'
let offscreenCreated = false;

// Listen for extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Background: Extension icon clicked - taking full page screenshot');
  
  if (isCapturing) {
    stopCapture();
    return;
  }
  
  // Directly take full page screenshot when extension icon is clicked
  try {
    // Use content script method that implements proper scrolling capture
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_FULL_PAGE_SCREENSHOT'
    });
    
    if (response && response.success) {
      console.log('Background: Full page screenshot completed:', response.message);
    } else {
      console.error('Background: Full page screenshot failed:', response?.error);
    }
  } catch (error) {
    console.error('Background: Error taking full page screenshot:', error);
  }
});

// Listen for messages from other contexts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background: Received message:', request);
  
  const handlers = {
    'resizeWindow': handleResizeWindow,
    'captureFullPage': handleFullPageCapture,
    'startScreenCapture': handleScreenCapture,
    'startTabCapture': handleTabCapture,
    'SAVE_RECORDING': handleSaveRecording,
    'CAPTURE_ERROR': handleCaptureError,
    'CAPTURE_STOPPED': handleCaptureStopped,
    'FALLBACK_TAB_SCREENSHOT': handleFallbackTabScreenshot,
    'SIMPLE_TAB_SCREENSHOT': handleSimpleTabScreenshot,
    'FULL_PAGE_SCREENSHOT': handleFullPageScreenshot,
    'STOP_CAPTURE': handleStopCapture,
    'GET_RECORDING_STATE': handleGetRecordingState,
    'COLOR_PICKED': handleColorPicked,
    'UPDATE_BLOCKING': handleBlockingUpdate,
    'GET_BLOCKING_STATUS': handleBlockingUpdate
  };
  
  const handler = handlers[request.type] || handlers[request.action] || (request.action && Array.isArray(request.action) ? handlers[request.action[0]] : null);
  
  if (handler) {
    console.log('Background: Found handler for message');
    handler(request, sender, sendResponse);
    return true; // Keep message channel open
  } else {
    console.log('Background: No handler found for message:', request);
  }
});

// Setup offscreen document for MediaRecorder access
async function setupOffscreenDocument() {
  if (offscreenCreated) return;
  
  try {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [chrome.runtime.getURL('offscreen.html')]
    });

    if (existingContexts.length === 0) {
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL('offscreen.html'),
        reasons: ['USER_MEDIA', 'DISPLAY_MEDIA'],
        justification: 'Recording screen content for screenshot functionality'
      });
      console.log('Background: Offscreen document created');
    }
    
    offscreenCreated = true;
  } catch (error) {
    console.error('Background: Error setting up offscreen document:', error);
  }
}

// Show capture type selection dialog
async function showCaptureDialog(tab) {
  try {
    // Inject a simple selection dialog
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Create capture selection modal
        const modal = document.createElement('div');
        modal.id = 'capture-modal';
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          max-width: 400px;
        `;
        
        dialog.innerHTML = `
          <h2 style="margin-top: 0; color: #333;">Screen Capture</h2>
          <p style="color: #666; margin-bottom: 20px;">Choose capture type:</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <button id="capture-tab-screenshot" style="
              padding: 12px 16px;
              background: #4285f4;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 13px;
            ">Tab Screenshot</button>
            <button id="capture-full-page" style="
              padding: 12px 16px;
              background: #1976d2;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 13px;
            ">Full Page Screenshot</button>
            <button id="capture-tab" style="
              padding: 12px 16px;
              background: #fbbc04;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 13px;
            ">Tab Recording</button>
            <button id="capture-screen" style="
              padding: 12px 16px;
              background: #34a853;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 13px;
              opacity: 0.5;
            " disabled>Screen Recording</button>
          </div>
          <button id="capture-cancel" style="
            padding: 8px 16px;
            background: transparent;
            color: #666;
            border: 1px solid #ddd;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            width: 100%;
          ">Cancel</button>
        `;
        
        modal.appendChild(dialog);
        document.body.appendChild(modal);
        
        // Handle button clicks
        document.getElementById('capture-tab-screenshot').onclick = () => {
          chrome.runtime.sendMessage({ type: 'SIMPLE_TAB_SCREENSHOT' });
          document.body.removeChild(modal);
        };
        
        document.getElementById('capture-full-page').onclick = () => {
          chrome.runtime.sendMessage({ type: 'FULL_PAGE_SCREENSHOT' });
          document.body.removeChild(modal);
        };
        
        document.getElementById('capture-tab').onclick = () => {
          chrome.runtime.sendMessage({ type: 'startTabCapture' });
          document.body.removeChild(modal);
        };
        
        document.getElementById('capture-screen').onclick = () => {
          chrome.runtime.sendMessage({ type: 'startScreenCapture' });
          document.body.removeChild(modal);
        };
        
        document.getElementById('capture-cancel').onclick = () => {
          document.body.removeChild(modal);
        };
        
        // Close on background click
        modal.onclick = (e) => {
          if (e.target === modal) {
            document.body.removeChild(modal);
          }
        };
      }
    });
  } catch (error) {
    console.error('Background: Error showing capture dialog:', error);
  }
}

// Handle window resize requests
function handleResizeWindow(request, sender, sendResponse) {
  console.log('Background: Handling resize window request:', request);
  
  if (request.action && request.action[0] === 'resizeWindow') {
    chrome.windows.getCurrent((window) => {
      if (!window) {
        console.error('Background: No current window found');
        sendResponse({ status: false, error: 'No current window found' });
        return;
      }
      
      const width = parseInt(request.action[1]);
      const height = parseInt(request.action[2]);
      
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        console.error('Background: Invalid dimensions:', width, height);
        sendResponse({ status: false, error: 'Invalid dimensions provided' });
        return;
      }
      
      const updateInfo = {
        width: width,
        height: height,
        state: 'normal'
      };
      
      console.log('Background: Updating window to:', updateInfo);
      
      chrome.windows.update(window.id, updateInfo)
        .then(() => {
          console.log('Background: Window resized successfully');
          sendResponse({ status: true });
        })
        .catch((error) => {
          console.error('Background: Error resizing window:', error);
          sendResponse({ status: false, error: error.message });
        });
    });
  } else {
    console.error('Background: Invalid resize request format:', request);
    sendResponse({ status: false, error: 'Invalid request format' });
  }
}

// Handle full page screenshot (fallback method)
async function handleFullPageCapture(request, sender, sendResponse) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      sendResponse({ success: false, error: 'No active tab found' });
      return;
    }
    
    const tab = tabs[0];
    
    // Try content script approach first
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_PAGE_SCREENSHOT'
    });
    
    sendResponse(response);
    
  } catch (error) {
    console.error('Background: Full page capture error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle screen capture using desktop capture API
async function handleScreenCapture(request, sender, sendResponse) {
  try {
    await setupOffscreenDocument();
    
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      sendResponse({ success: false, error: 'No active tab found' });
      return;
    }
    
    const tab = tabs[0];
    
    chrome.desktopCapture.chooseDesktopMedia(
      ['screen', 'window'], // Available sources
      tab, // Required tab parameter for V3
      (streamId) => {
        if (streamId) {
          console.log('Background: Desktop capture stream ID obtained:', streamId);
          isCapturing = true;
          currentRecordingType = 'screen';
          updateCaptureIndicator(true);
          
          // Send to offscreen document
          chrome.runtime.sendMessage({
            type: 'START_SCREEN_CAPTURE',
            target: 'offscreen',
            streamId: streamId
          });
          
          sendResponse({ success: true, message: 'Screen capture started' });
        } else {
          console.log('Background: User cancelled screen capture');
          sendResponse({ success: false, error: 'User cancelled capture' });
        }
      }
    );
    
  } catch (error) {
    console.error('Background: Screen capture error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle tab capture
async function handleTabCapture(request, sender, sendResponse) {
  try {
    await setupOffscreenDocument();
    
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      sendResponse({ success: false, error: 'No active tab found' });
      return;
    }
    
    const tab = tabs[0];
    
    chrome.tabCapture.getMediaStreamId({
      targetTabId: tab.id
    }, (streamId) => {
      if (streamId) {
        console.log('Background: Tab capture stream ID obtained:', streamId);
        isCapturing = true;
        currentRecordingType = 'tab';
        updateCaptureIndicator(true);
        
        // Send to offscreen document
        chrome.runtime.sendMessage({
          type: 'START_TAB_CAPTURE',
          target: 'offscreen',
          streamId: streamId
        });
        
        // Notify content script to show floating stop button
        chrome.tabs.sendMessage(tab.id, {
          type: 'TAB_RECORDING_STARTED'
        }).catch(() => {
          console.log('Background: Could not notify content script (tab may not have content script loaded)');
        });
        
        sendResponse({ success: true, message: 'Tab capture started' });
      } else {
        console.log('Background: Failed to get tab capture stream');
        sendResponse({ success: false, error: 'Failed to capture tab' });
      }
    });
    
  } catch (error) {
    console.error('Background: Tab capture error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle simple tab screenshot (direct capture without permission dialog)
async function handleSimpleTabScreenshot(request, sender, sendResponse) {
  try {
    console.log('Background: Taking simple tab screenshot');
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    // Download the screenshot
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    await chrome.downloads.download({
      url: screenshot,
      filename: `page-screenshot-${timestamp}.png`
    });
    
    sendResponse({ success: true, message: 'Page screenshot captured and downloaded' });
    
  } catch (error) {
    console.error('Background: Simple tab screenshot error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle full page screenshot (scrolling capture)
async function handleFullPageScreenshot(request, sender, sendResponse) {
  try {
    console.log('Background: Taking full page screenshot');
    
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      sendResponse({ success: false, error: 'No active tab found' });
      return;
    }
    
    const tab = tabs[0];
    
    // Send to content script to handle scrolling and stitching
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_FULL_PAGE_SCREENSHOT'
    });
    
    sendResponse(response);
    
  } catch (error) {
    console.error('Background: Full page screenshot error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle fallback tab screenshot
async function handleFallbackTabScreenshot(request, sender, sendResponse) {
  try {
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    // Download the screenshot
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    await chrome.downloads.download({
      url: screenshot,
      filename: `tab-screenshot-${timestamp}.png`
    });
    
    sendResponse({ success: true, message: 'Screenshot captured and downloaded' });
    
  } catch (error) {
    console.error('Background: Fallback screenshot error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle recording save
async function handleSaveRecording(request, sender, sendResponse) {
  try {
    console.log('Background: Saving recording...');
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `${request.captureType}-recording-${timestamp}.webm`;
    
    await chrome.downloads.download({
      url: request.data,
      filename: filename
    });
    
    console.log('Background: Recording saved:', filename);
    updateCaptureIndicator(false);
    isCapturing = false;
    currentRecordingType = null;
    
    // Notify all extension contexts that recording is complete
    await broadcastMessage({
      type: 'RECORDING_COMPLETED',
      filename: filename,
      captureType: request.captureType
    });
    
  } catch (error) {
    console.error('Background: Error saving recording:', error);
    await broadcastMessage({
      type: 'RECORDING_STOPPED',
      error: error.message
    });
  }
}

// Handle capture errors
function handleCaptureError(request, sender, sendResponse) {
  console.error('Background: Capture error:', request.error);
  updateCaptureIndicator(false);
  isCapturing = false;
  currentRecordingType = null;
}

// Handle capture stopped
function handleCaptureStopped(request, sender, sendResponse) {
  console.log('Background: Capture stopped');
  updateCaptureIndicator(false);
  isCapturing = false;
  currentRecordingType = null;
}

// Update capture indicator
function updateCaptureIndicator(capturing) {
  if (capturing) {
    chrome.action.setBadgeText({ text: "REC" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    chrome.action.setTitle({ title: "Recording... Click to stop" });
  } else {
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setTitle({ title: "Screen Capture Tool" });
  }
}

// Stop current capture
function stopCapture() {
  console.log('Background: Stopping capture');
  isCapturing = false;
  currentRecordingType = null;
  updateCaptureIndicator(false);
  
  // Send stop message to offscreen document
  chrome.runtime.sendMessage({
    type: 'STOP_CAPTURE',
    target: 'offscreen'
  });
}

// Clean up on service worker suspend
chrome.runtime.onSuspend.addListener(() => {
  console.log('Background: Service worker suspending, cleaning up...');
  stopCapture();
});

// Handle stop capture request
async function handleStopCapture(request, sender, sendResponse) {
  console.log('Background: Stop capture requested');
  stopCapture();
  
  // Notify all extension contexts that recording is stopped
  await broadcastMessage({
    type: 'RECORDING_STOPPED',
    reason: 'User stopped recording'
  });
  
  sendResponse({ success: true, message: 'Recording stopped' });
}

// Handle get recording state request
function handleGetRecordingState(request, sender, sendResponse) {
  console.log('Background: Get recording state requested, isCapturing:', isCapturing, 'type:', currentRecordingType);
  sendResponse({ 
    isRecording: isCapturing,
    recordingType: currentRecordingType
  });
}

// Broadcast message to all extension contexts
async function broadcastMessage(message) {
  try {
    // Send to popup
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup might not be open, which is fine
    });
    
    // Send to all tabs with the extension content script
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // Content script might not be loaded, which is fine
      });
    });
    
    console.log('Background: Broadcasted message:', message.type);
  } catch (error) {
    console.error('Background: Error broadcasting message:', error);
  }
}

// Handle installation and context menu setup
chrome.runtime.onInstalled.addListener(() => {
  console.log('Background: Extension installed/updated');
  
  // Create context menu for eyedropper
  chrome.contextMenus.create({
    id: 'eyedropper-color-picker',
    title: 'Pick color from page',
    contexts: ['page', 'image', 'video'],
    documentUrlPatterns: ['http://*/*', 'https://*/*']
  });
  
  chrome.contextMenus.create({
    id: 'separator-1',
    type: 'separator',
    contexts: ['page', 'image', 'video'],
    documentUrlPatterns: ['http://*/*', 'https://*/*']
  });
  
  chrome.contextMenus.create({
    id: 'quick-screenshot',
    title: 'Take screenshot',
    contexts: ['page'],
    documentUrlPatterns: ['http://*/*', 'https://*/*']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Background: Context menu clicked:', info.menuItemId);
  
  switch (info.menuItemId) {
    case 'eyedropper-color-picker':
      handleEyeDropperFromContext(tab);
      break;
    case 'quick-screenshot':
      handleQuickScreenshot(tab);
      break;
  }
});

// Handle eyedropper activation from context menu
async function handleEyeDropperFromContext(tab) {
  try {
    console.log('Background: Starting eyedropper from context menu for tab:', tab.id);
    
    if (!tab || !tab.id) {
      console.error('Background: Invalid tab for eyedropper');
      return;
    }
    
    // Send message to content script to start eyedropper
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'START_EYEDROPPER'
    });
    
    console.log('Background: EyeDropper response:', response);
    
    if (response && response.success) {
      console.log('Background: EyeDropper started successfully, color:', response.color);
    } else {
      console.error('Background: EyeDropper failed to start:', response?.error);
    }
  } catch (error) {
    console.error('Background: Error starting eyedropper from context menu:', error);
    
    // Try to inject content script if it's not loaded
    try {
      console.log('Background: Attempting to inject content script...');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Try again after injection
      setTimeout(async () => {
        try {
          const retryResponse = await chrome.tabs.sendMessage(tab.id, {
            type: 'START_EYEDROPPER'
          });
          console.log('Background: Retry EyeDropper response:', retryResponse);
        } catch (retryError) {
          console.error('Background: Retry also failed:', retryError);
        }
      }, 100);
    } catch (injectionError) {
      console.error('Background: Could not inject content script:', injectionError);
    }
  }
}

// Handle quick screenshot from context menu
async function handleQuickScreenshot(tab) {
  try {
    console.log('Background: Taking quick screenshot from context menu');
    
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    // Download the screenshot
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    await chrome.downloads.download({
      url: screenshot,
      filename: `context-screenshot-${timestamp}.png`
    });
    
    console.log('Background: Quick screenshot saved');
  } catch (error) {
    console.error('Background: Error taking quick screenshot:', error);
  }
}

// Handle color picked from eyedropper
function handleColorPicked(request, sender, sendResponse) {
  console.log('Background: handleColorPicked called with:', request);
  
  (async () => {
    try {
      console.log('Background: Color picked:', request.color);
      
      // Store the color in Chrome storage
      const result = await chrome.storage.local.get(['colorHistory']);
      let colorHistory = result.colorHistory || [];
      
      // Create color entry
      const colorEntry = {
        id: Date.now().toString(),
        hex: request.color,
        timestamp: request.timestamp || Date.now(),
        source: request.source || 'eye_drop',
        sourceName: request.sourceName || 'EyeDropper',
        context: `Picked from ${sender.tab?.url || 'unknown page'}`
      };
      
      // Add to history (prevent duplicates)
      colorHistory = colorHistory.filter(entry => entry.hex !== request.color);
      colorHistory.unshift(colorEntry);
      
      // Keep only last 50 colors
      if (colorHistory.length > 50) {
        colorHistory = colorHistory.slice(0, 50);
      }
      
      // Save to storage
      await chrome.storage.local.set({ colorHistory });
      
      console.log('Background: Color saved to history:', colorEntry);
      sendResponse({ success: true, colorEntry });
      
    } catch (error) {
      console.error('Background: Error handling color picked:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Keep message channel open for async response
}

// Website blocking functionality
let blockingEnabled = false;
let blockedSites = [];

// Initialize blocking settings on startup
async function initializeBlocking() {
  try {
    const result = await chrome.storage.local.get(['blockingEnabled', 'blockedSites']);
    blockingEnabled = result.blockingEnabled || false;
    blockedSites = result.blockedSites || [];
    console.log('Background: Blocking initialized - enabled:', blockingEnabled, 'sites:', blockedSites.length);
  } catch (error) {
    console.error('Background: Error initializing blocking:', error);
  }
}

// Check if URL should be blocked
function shouldBlockUrl(url) {
  if (!blockingEnabled || !blockedSites.length) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return blockedSites.some(site => {
      const normalizedSite = site.trim().toLowerCase();
      if (!normalizedSite) return false;
      
      // Remove protocol if present
      const cleanSite = normalizedSite.replace(/^https?:\/\//, '');
      
      // Check exact match or subdomain match
      return hostname === cleanSite || hostname.endsWith('.' + cleanSite);
    });
  } catch (error) {
    console.error('Background: Error checking URL:', error);
    return false;
  }
}

// Handle website blocking requests
async function handleBlockingUpdate(request, sender, sendResponse) {
  try {
    if (request.type === 'UPDATE_BLOCKING') {
      blockingEnabled = request.enabled;
      blockedSites = request.sites || [];
      
      // Save to storage
      await chrome.storage.local.set({
        blockingEnabled: blockingEnabled,
        blockedSites: blockedSites
      });
      
      console.log('Background: Blocking settings updated - enabled:', blockingEnabled, 'sites:', blockedSites.length);
      sendResponse({ success: true });
    } else if (request.type === 'GET_BLOCKING_STATUS') {
      sendResponse({
        success: true,
        enabled: blockingEnabled,
        sites: blockedSites
      });
    }
  } catch (error) {
    console.error('Background: Error handling blocking update:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Block navigation to blocked sites
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0 && shouldBlockUrl(details.url)) {
    console.log('Background: Blocking navigation to:', details.url);
    
    // Redirect to a blocked page
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(details.url)
    });
  }
});

// Initialize blocking on startup
initializeBlocking();