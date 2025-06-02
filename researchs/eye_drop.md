# Building a Chrome color picker extension with Manifest V3

Creating a Chrome extension color picker in Manifest V3 requires implementing the EyeDropper API for color capture, configuring specific permissions in manifest.json, establishing service worker-based architecture, and handling cross-origin restrictions through background script processing. The modern approach leverages the native EyeDropper API introduced in Chrome 95, which provides secure, user-gesture-based color picking without the complex canvas workarounds previously required.

## Core manifest configuration and permissions

The Manifest V3 structure fundamentally changes how Chrome extensions operate, replacing background pages with service workers and consolidating action types. For a color picker extension, the essential manifest.json configuration requires three critical permissions: **activeTab** for temporary access to the current tab, **scripting** for programmatic script injection, and **storage** for persisting color history. The activeTab permission is particularly important as it grants access only when users explicitly invoke the extension, avoiding the security warnings associated with broader host permissions.

```json
{
  "manifest_version": 3,
  "name": "Color Picker Extension",
  "version": "1.0.0",
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon-16.png",
      "32": "images/icon-32.png"
    }
  },
  "background": {
    "service_worker": "service-worker.js"
  },
  "permissions": ["activeTab", "scripting", "storage"],
  "content_scripts": [{
    "matches": ["*://*/*"],
    "js": ["content-script.js"],
    "run_at": "document_end"
  }]
}
```

The service worker replaces the traditional background script, operating on an event-driven model that **terminates after 5 minutes of inactivity**. This lifecycle management requires careful handling of state persistence through chrome.storage APIs rather than global variables. Message passing between the service worker and content scripts forms the communication backbone, with chrome.runtime.sendMessage and chrome.tabs.sendMessage facilitating bidirectional data flow.

## Native EyeDropper API implementation

The EyeDropper API, available in **Chrome 95 and later**, provides the most straightforward and secure method for color picking. This browser-native API requires a user gesture to activate, ensuring explicit user consent for each color selection. The implementation is remarkably concise compared to previous canvas-based approaches:

```javascript
class ColorPicker {
  async startColorPicking() {
    if (!window.EyeDropper) {
      throw new Error('EyeDropper API not supported');
    }
    
    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      return {
        success: true,
        color: result.sRGBHex,
        timestamp: Date.now()
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Color picking cancelled');
      }
      throw error;
    }
  }
}
```

For browsers without EyeDropper support or when additional features are needed, a canvas-based fallback remains viable. This approach involves capturing the visible tab using chrome.tabs.captureVisibleTab, creating an overlay canvas, and reading pixel data through getImageData. However, this method faces **significant cross-origin restrictions** that require careful handling.

## Navigating cross-origin limitations

Cross-origin resource sharing (CORS) presents the most significant technical challenge for color picker extensions. Canvas elements become "tainted" when drawing cross-origin images, preventing pixel data extraction through getImageData. The primary workaround involves **processing images in the background script** where CORS restrictions are less stringent:

```javascript
// In service worker - bypass CORS for image processing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processImage') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      sendResponse({data: Array.from(imageData.data)});
    };
    img.src = request.url;
    return true; // Keep channel open for async response
  }
});
```

For more complex scenarios, Chrome's **offscreen documents API** (introduced for MV3) provides a sandboxed environment for DOM manipulation without cross-origin restrictions. This approach is particularly useful for processing video streams, SVG elements, or complex CSS gradients that require sophisticated color extraction techniques.

## Advanced color capture techniques

Modern web pages present unique challenges for color extraction beyond simple pixel reading. CSS gradients require parsing computed styles to extract color stops, while video elements need frame capture through canvas drawing. **Pseudo-elements (::before, ::after) cannot be directly accessed** through the DOM, necessitating computed style analysis or temporary element injection for color extraction.

The implementation must handle multiple color formats and color spaces. Modern CSS supports **display-p3** and **rec2020** color spaces alongside traditional sRGB, requiring sophisticated color space detection and conversion:

```javascript
class ColorConverter {
  static rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => 
      x.toString(16).padStart(2, '0')
    ).join('');
  }
  
  static detectColorSpace(element) {
    const style = window.getComputedStyle(element);
    if (style.color.includes('display-p3')) return 'display-p3';
    if (style.color.includes('rec2020')) return 'rec2020';
    return 'srgb';
  }
}
```

Performance optimization becomes critical when implementing real-time color sampling. **RequestAnimationFrame-based debouncing** ensures smooth 60fps performance, while canvas pooling reduces memory allocation overhead. For computationally intensive operations, Web Workers can process color data without blocking the main thread.

## Building an effective user interface

The popup interface serves as the primary interaction point, requiring careful balance between functionality and simplicity. Modern implementations feature **grid-based color history displays**, format switching between HEX/RGB/HSL, and one-click clipboard copying. The Clipboard API provides the standard approach for color copying, with a textarea-based fallback for older browsers:

```javascript
async function copyToClipboard(color) {
  try {
    await navigator.clipboard.writeText(color);
    showCopyFeedback();
  } catch (err) {
    // Fallback implementation
    const textarea = document.createElement('textarea');
    textarea.value = color;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}
```

Three exemplary open-source implementations demonstrate best practices: **getlost01/color-picker-updated** showcases comprehensive color tools including naming and mixing features, **kepi/chromeEyeDropper** implements modern development workflows with hot module replacement, and **Thomas-lhuillier/Black-shrimp** provides professional integration through Adobe Swatch Exchange file export.

## Integration patterns for development workflows

Professional color picker extensions extend beyond simple color capture to integrate seamlessly with design and development workflows. Color history management typically stores the **last 50 picked colors** in chrome.storage.local, with duplicate detection preventing redundant entries. Export functionality supports multiple formats including CSS variables, JSON, and design tool-specific formats like .ase files for Adobe applications.

Keyboard shortcuts enhance power user efficiency, with common patterns including **Alt+P for color picking** and **Escape for cancellation**. The extension can also generate color palettes, providing complementary colors, shades, and accessibility-compliant combinations based on WCAG guidelines.

## Conclusion

Building a Chrome color picker extension for Manifest V3 requires navigating significant architectural changes from previous manifest versions while leveraging modern browser APIs for improved functionality. The **EyeDropper API represents the future** of color picking, offering native performance and security benefits over canvas-based approaches. However, comprehensive implementations must still handle cross-origin challenges, support various element types, and provide robust fallbacks for maximum compatibility.

Success depends on three critical factors: proper permission configuration that balances functionality with user privacy, efficient message passing between isolated contexts, and thoughtful UI design that serves both casual users and professional workflows. By following these patterns and leveraging the proven approaches from successful open-source implementations, developers can create color picker extensions that are both powerful and maintainable in the evolving Chrome extension ecosystem.git co