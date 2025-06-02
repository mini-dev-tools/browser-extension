// Content script for screen capture functionality and script injection
console.log('Content script loaded for screen capture and script injection');

let floatingStopButton = null;

// Global keyboard shortcut handler for EyeDropper
function handleKeydown(event) {
  // Only log when P key is pressed to avoid spam
  if (event.key.toLowerCase() === 'p') {
    console.log('Content: P key pressed with modifiers:', {
      key: event.key,
      altKey: event.altKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      code: event.code,
      location: event.location
    });
  }
  
  // Alt + P for eyedropper (Option + P on Mac)
  // Try multiple approaches to detect Option key on Mac
  if ((event.altKey || event.getModifierState('Alt')) && event.key.toLowerCase() === 'p') {
    console.log('Content: Alt+P (Option+P) keyboard shortcut triggered - starting eyedropper');
    event.preventDefault();
    event.stopPropagation();
    startEyeDropperGlobal();
  }
}

// Listen for Option key specifically (Mac)
document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyP' && event.altKey) {
    console.log('Content: Option+P detected via separate listener');
    event.preventDefault();
    startEyeDropperGlobal();
  }
}, true);

// Add keyboard listener when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', handleKeydown, true); // Use capture phase
    console.log('Content: Keyboard listener added after DOMContentLoaded');
  });
} else {
  document.addEventListener('keydown', handleKeydown, true); // Use capture phase
  console.log('Content: Keyboard listener added immediately');
}

// Function to add color directly to localStorage history (same format as popup)
function addColorToLocalStorageHistory(hex, source, sourceName) {
  try {
    const storageKey = 'color-history';
    const existingHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Generate proper UUID for consistency
    const generateId = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    // Create new history item in same format as Pinia store
    const historyItem = {
      id: generateId(),
      hex: hex.toLowerCase(),
      timestamp: Date.now(),
      source: source || 'eye_drop',
      sourceName: sourceName || 'EyeDropper',
      context: `Picked from ${window.location.hostname}`
    };
    
    // Remove any existing entry with same color
    const filteredHistory = existingHistory.filter(item => 
      item.hex.toLowerCase() !== hex.toLowerCase()
    );
    
    // Add new item to front
    const newHistory = [historyItem, ...filteredHistory];
    
    // Limit to 50 items
    const limitedHistory = newHistory.slice(0, 50);
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(limitedHistory));
    
    // Also save to Chrome storage for cross-context sync
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 'color-history': limitedHistory }).catch(err => {
        console.log('Content: Could not sync to Chrome storage:', err);
      });
    }
    
    console.log('Content: Added color to localStorage history:', hex, limitedHistory.length, 'total items');
  } catch (error) {
    console.error('Content: Error adding color to localStorage history:', error);
  }
}

// Global EyeDropper function for keyboard shortcut
async function startEyeDropperGlobal() {
  console.log('Content: Global EyeDropper started via keyboard shortcut');
  
  if (!('EyeDropper' in window)) {
    console.warn('Content: EyeDropper API not supported in this browser');
    return;
  }

  try {
    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    
    if (result && result.sRGBHex) {
      console.log('Content: Global EyeDropper picked color:', result.sRGBHex);
      
      // Add directly to localStorage history (same as popup uses)
      addColorToLocalStorageHistory(result.sRGBHex, 'eye_drop', 'Keyboard Shortcut EyeDropper');
      
      // Show notification
      showColorPickedNotification(result.sRGBHex);
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Content: Global EyeDropper error:', error);
    } else {
      console.log('Content: Global EyeDropper cancelled by user');
    }
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'CAPTURE_PAGE_SCREENSHOT':
      capturePageScreenshot().then(sendResponse);
      return true; // Keep message channel open
    
    case 'CAPTURE_FULL_PAGE_SCREENSHOT':
      captureFullPageScreenshot().then(sendResponse);
      return true; // Keep message channel open
    
    case 'START_DISPLAY_CAPTURE':
      startDisplayCapture().then(sendResponse);
      return true;
    
    case 'HIDE_EXTENSION_UI':
      hideExtensionElements();
      sendResponse({ success: true });
      break;
    
    case 'RESTORE_EXTENSION_UI':
      restoreExtensionElements();
      sendResponse({ success: true });
      break;
      
    case 'RECORDING_COMPLETED':
    case 'RECORDING_STOPPED':
      hideFloatingStopButton();
      sendResponse({ success: true });
      break;
      
    case 'TAB_RECORDING_STARTED':
      showFloatingStopButton();
      sendResponse({ success: true });
      break;
      
    case 'START_EYEDROPPER':
      console.log('Content: Received START_EYEDROPPER message from background');
      startEyeDropperFromContent().then(sendResponse);
      return true; // Keep message channel open
  }
});

// Modern approach using getDisplayMedia (user choice)
async function startDisplayCapture() {
  try {
    console.log('Content: Starting display media capture');
    
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: 'screen',
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        frameRate: { ideal: 30, max: 30 }
      },
      audio: true
    });
    
    console.log('Content: Display media stream obtained');
    
    // Start recording using MediaRecorder
    const mediaRecorder = new MediaRecorder(stream, {
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
      downloadRecording(blob, 'screen-capture');
    };
    
    mediaRecorder.start();
    
    // Stop when user stops sharing
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      console.log('Content: User stopped sharing, ending recording');
      mediaRecorder.stop();
    });
    
    return { success: true, message: 'Recording started' };
    
  } catch (error) {
    console.error('Content: Display capture error:', error);
    return { success: false, error: error.message };
  }
}

// Screenshot capture using html2canvas or similar approach
async function capturePageScreenshot() {
  try {
    console.log('Content: Starting page screenshot');
    
    // Hide extension UI elements before capture
    hideExtensionElements();
    
    // Wait for UI to hide
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Use canvas-based screenshot if html2canvas is available
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(document.body, {
        height: document.body.scrollHeight,
        width: document.body.scrollWidth,
        useCORS: true,
        allowTaint: true
      });
      
      canvas.toBlob((blob) => {
        downloadRecording(blob, 'page-screenshot');
        restoreExtensionElements();
      }, 'image/png');
      
      return { success: true, message: 'Screenshot captured' };
    } else {
      // Fallback to Chrome's tab capture
      return await chrome.runtime.sendMessage({
        type: 'FALLBACK_TAB_SCREENSHOT'
      });
    }
    
  } catch (error) {
    console.error('Content: Screenshot error:', error);
    restoreExtensionElements();
    return { success: false, error: error.message };
  }
}

// Full page screenshot with canvas-based approach
async function captureFullPageScreenshot() {
  try {
    console.log('Content: Starting full page screenshot');
    
    // Hide extension UI elements before capture
    hideExtensionElements();
    
    // Wait for UI to hide
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get page dimensions
    const totalHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    const totalWidth = Math.max(
      document.body.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.clientWidth,
      document.documentElement.scrollWidth,
      document.documentElement.offsetWidth
    );
    
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    console.log('Content: Page dimensions - Total:', totalWidth, 'x', totalHeight, 'Viewport:', viewportWidth, 'x', viewportHeight);
    
    // Store original scroll position
    const originalScrollY = window.scrollY;
    const originalScrollX = window.scrollX;
    
    try {
      // Create a canvas to capture the full page
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(totalWidth, 16384); // Chrome canvas limit
      canvas.height = Math.min(totalHeight, 16384); // Chrome canvas limit
      const ctx = canvas.getContext('2d');
      
      // If page is larger than canvas limits, scale it down
      const scaleX = canvas.width / totalWidth;
      const scaleY = canvas.height / totalHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      if (scale < 1) {
        console.log('Content: Scaling page down by', scale, 'to fit canvas limits');
        ctx.scale(scale, scale);
      }
      
      // Try to use html2canvas if available
      if (typeof html2canvas !== 'undefined') {
        console.log('Content: Using html2canvas for full page capture');
        const htmlCanvas = await html2canvas(document.documentElement, {
          height: totalHeight,
          width: totalWidth,
          useCORS: true,
          allowTaint: true,
          scale: scale
        });
        
        htmlCanvas.toBlob((blob) => {
          downloadRecording(blob, 'full-page-screenshot');
        }, 'image/png');
        
        return { success: true, message: 'Full page screenshot captured using html2canvas' };
      } else {
        // Fallback: Use DOM to Canvas approach
        console.log('Content: Using DOM-to-Canvas capture method');
        
        // Scroll to top-left corner
        window.scrollTo(0, 0);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Draw the document content onto canvas using DOM methods
        try {
          // Create a simplified representation by cloning and rendering the DOM
          const clonedDocument = document.documentElement.cloneNode(true);
          
          // Convert DOM to canvas using foreign object
          const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="width:${totalWidth}px;height:${totalHeight}px;">
                ${document.documentElement.innerHTML}
              </div>
            </foreignObject>
          </svg>`;
          
          const img = new Image();
          const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
          const url = URL.createObjectURL(svgBlob);
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(url);
              
              canvas.toBlob((blob) => {
                downloadRecording(blob, 'full-page-screenshot');
                resolve();
              }, 'image/png');
            };
            img.onerror = reject;
            img.src = url;
          });
          
          return { success: true, message: 'Full page screenshot captured using DOM-to-Canvas' };
        } catch (domError) {
          console.error('Content: DOM-to-Canvas failed:', domError);
          
          // Final fallback: Just take a regular screenshot
          console.log('Content: Using simple fallback screenshot');
          const response = await chrome.runtime.sendMessage({
            type: 'SIMPLE_TAB_SCREENSHOT'
          });
          
          return response || { success: true, message: 'Simple screenshot captured as fallback' };
        }
      }
      
    } finally {
      // Restore original scroll position
      window.scrollTo(originalScrollX, originalScrollY);
      restoreExtensionElements();
    }
    
  } catch (error) {
    console.error('Content: Full page screenshot error:', error);
    restoreExtensionElements();
    return { success: false, error: error.message };
  }
}

// Store hidden elements for restoration
let hiddenElements = [];

function hideExtensionElements() {
  hiddenElements = [];
  
  // Hide the floating stop button if it exists
  if (floatingStopButton) {
    hiddenElements.push({
      element: floatingStopButton,
      originalDisplay: floatingStopButton.style.display
    });
    floatingStopButton.style.display = 'none';
  }
  
  // Hide extension-related elements
  const extensionSelectors = [
    '[class*="extension"]',
    '[id*="extension"]',
    '[class*="chrome-extension"]',
    '[data-extension]',
    'nav[class*="sticky"]',
    '.sticky',
    '#chrome-extension-stop-button' // Explicitly target our floating button
  ];
  
  extensionSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      hiddenElements.push({
        element: el,
        originalDisplay: el.style.display
      });
      el.style.display = 'none';
    });
  });
  
  // Hide fixed/sticky positioned elements at the top
  const topElements = document.querySelectorAll('nav, header, [class*="nav"]');
  topElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    
    if ((styles.position === 'fixed' || styles.position === 'sticky') && 
        rect.top <= 60 && rect.left <= 100 && rect.width > 200) {
      hiddenElements.push({
        element: el,
        originalDisplay: el.style.display
      });
      el.style.display = 'none';
    }
  });
  
  console.log('Content: Hidden', hiddenElements.length, 'extension elements');
}

function restoreExtensionElements() {
  hiddenElements.forEach(item => {
    if (item.element && item.element.style) {
      item.element.style.display = item.originalDisplay || '';
    }
  });
  
  hiddenElements = [];
  console.log('Content: Restored extension elements');
}

function downloadRecording(blob, prefix) {
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const filename = `${prefix}-${timestamp}.${blob.type.includes('video') ? 'webm' : 'png'}`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  
  console.log('Content: Downloaded', filename);
}

// Show floating stop button for tab recording
function showFloatingStopButton() {
  if (floatingStopButton) {
    hideFloatingStopButton();
  }
  
  console.log('Content: Showing floating stop button');
  
  floatingStopButton = document.createElement('div');
  floatingStopButton.id = 'chrome-extension-stop-button';
  floatingStopButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    background: #ff4444;
    border: 2px solid #ffffff;
    border-radius: 50%;
    cursor: pointer;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  `;
  
  // Add stop icon (square)
  const stopIcon = document.createElement('div');
  stopIcon.style.cssText = `
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 1px;
  `;
  
  floatingStopButton.appendChild(stopIcon);
  
  // Add hover effects
  floatingStopButton.addEventListener('mouseenter', () => {
    floatingStopButton.style.transform = 'scale(1.1)';
    floatingStopButton.style.background = '#ff2222';
  });
  
  floatingStopButton.addEventListener('mouseleave', () => {
    floatingStopButton.style.transform = 'scale(1)';
    floatingStopButton.style.background = '#ff4444';
  });
  
  // Handle click to stop recording
  floatingStopButton.addEventListener('click', () => {
    console.log('Content: Floating stop button clicked');
    chrome.runtime.sendMessage({ type: 'STOP_CAPTURE' });
    hideFloatingStopButton();
  });
  
  document.body.appendChild(floatingStopButton);
}

// Hide floating stop button
function hideFloatingStopButton() {
  if (floatingStopButton) {
    console.log('Content: Hiding floating stop button');
    document.body.removeChild(floatingStopButton);
    floatingStopButton = null;
  }
}

// EyeDropper functionality for content script
async function startEyeDropperFromContent() {
  try {
    console.log('Content: Starting eyedropper from context menu');
    
    if (!('EyeDropper' in window)) {
      console.warn('Content: EyeDropper API not supported in this browser');
      return { success: false, error: 'EyeDropper API not supported' };
    }

    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    
    if (result && result.sRGBHex) {
      console.log('Content: Color picked:', result.sRGBHex);
      
      // Add directly to localStorage history (same as popup uses)
      addColorToLocalStorageHistory(result.sRGBHex, 'eye_drop', 'Context Menu EyeDropper');
      
      // Show temporary notification
      showColorPickedNotification(result.sRGBHex);
      
      return { success: true, color: result.sRGBHex };
    } else {
      return { success: false, error: 'No color selected' };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Content: EyeDropper cancelled by user');
      return { success: false, error: 'User cancelled' };
    }
    console.error('Content: EyeDropper error:', error);
    return { success: false, error: error.message };
  }
}

// Show temporary notification when color is picked
function showColorPickedNotification(color) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-left: 4px solid ${color};
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="width: 20px; height: 20px; background: ${color}; border-radius: 4px; border: 2px solid white;"></div>
    <div>
      <div style="font-weight: bold;">Color Picked</div>
      <div style="font-size: 12px; opacity: 0.8;">${color}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Copy to clipboard
  navigator.clipboard.writeText(color).then(() => {
    const copyMsg = document.createElement('div');
    copyMsg.style.cssText = `
      font-size: 11px;
      opacity: 0.7;
      margin-top: 2px;
    `;
    copyMsg.textContent = 'Copied to clipboard';
    notification.appendChild(copyMsg);
  }).catch(() => {
    console.log('Content: Could not copy to clipboard');
  });
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 3000);
}

// Script Injection Auto-Loading
// Check and inject persistent scripts when page loads
async function checkAndInjectPersistentScripts() {
  try {
    // Get saved scripts from chrome storage
    const result = await chrome.storage.local.get('persistentScripts');
    let scripts = result.persistentScripts || [];
    
    // Ensure scripts is an array
    if (!Array.isArray(scripts)) {
      console.warn('Content: persistentScripts is not an array, converting:', scripts);
      scripts = [];
    }
    
    if (scripts.length === 0) {
      console.log('Content: No persistent scripts found');
      return;
    }
    
    const currentUrl = window.location.href;
    console.log('Content: Checking scripts for URL:', currentUrl);
    
    // Filter enabled scripts that match current URL
    const matchingScripts = scripts.filter(script => {
      if (!script.enabled) return false;
      
      // Convert glob pattern to regex
      const regexPattern = script.urlPattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      
      try {
        const regex = new RegExp('^' + regexPattern + '$', 'i');
        return regex.test(currentUrl);
      } catch (error) {
        console.warn('Content: Invalid URL pattern:', script.urlPattern, error);
        return false;
      }
    });
    
    console.log('Content: Found', matchingScripts.length, 'matching scripts');
    
    // Inject matching scripts
    for (const script of matchingScripts) {
      try {
        if (script.type === 'javascript') {
          console.log('Content: Injecting JavaScript script:', script.name);
          
          // Create script element and inject
          const scriptElement = document.createElement('script');
          scriptElement.textContent = script.code;
          scriptElement.setAttribute('data-injected-by', 'arzs-dev-tools');
          scriptElement.setAttribute('data-script-name', script.name);
          
          // Inject into document head or body
          (document.head || document.documentElement).appendChild(scriptElement);
          
        } else if (script.type === 'css') {
          console.log('Content: Injecting CSS script:', script.name);
          
          // Create style element and inject
          const styleElement = document.createElement('style');
          styleElement.textContent = script.code;
          styleElement.setAttribute('data-injected-by', 'arzs-dev-tools');
          styleElement.setAttribute('data-script-name', script.name);
          
          // Inject into document head
          (document.head || document.documentElement).appendChild(styleElement);
        }
        
        console.log('Content: Successfully injected script:', script.name);
      } catch (error) {
        console.error('Content: Error injecting script:', script.name, error);
      }
    }
    
    if (matchingScripts.length > 0) {
      console.log('Content: Auto-injection completed for', matchingScripts.length, 'scripts');
    }
  } catch (error) {
    console.error('Content: Error in auto-injection:', error);
  }
}

// Run auto-injection when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInjectPersistentScripts);
} else {
  // Document already loaded
  checkAndInjectPersistentScripts();
}

// Also check when navigating in SPAs
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('Content: URL changed, checking for script injection');
    setTimeout(checkAndInjectPersistentScripts, 100); // Small delay for SPA navigation
  }
}).observe(document, { subtree: true, childList: true });