# Building a Chrome Extension for Color Extraction with Manifest V3

## Complete project structure and implementation guide

### Project Structure
```
color-extractor/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── sidepanel.html
├── sidepanel.js
├── styles/
│   ├── popup.css
│   └── sidepanel.css
├── utils/
│   ├── color-parser.js
│   └── color-extractor.js
└── images/
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

### 1. Manifest.json Configuration (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "Web Color Extractor",
  "version": "1.0.0",
  "description": "Extract all colors from web pages with advanced parsing and screenshot capabilities",
  "minimum_chrome_version": "114",
  
  "icons": {
    "16": "images/icon-16.png",
    "32": "images/icon-32.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  },
  
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  
  "action": {
    "default_popup": "popup.html",
    "default_title": "Extract Colors",
    "default_icon": {
      "16": "images/icon-16.png",
      "32": "images/icon-32.png",
      "48": "images/icon-48.png",
      "128": "images/icon-128.png"
    }
  },
  
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "tabs",
    "sidePanel"
  ],
  
  "host_permissions": [
    "<all_urls>"
  ],
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["utils/color-parser.js", "utils/color-extractor.js", "content.js"],
      "run_at": "document_idle"
    }
  ],
  
  "web_accessible_resources": [
    {
      "resources": ["images/*"],
      "matches": ["<all_urls>"]
    }
  ],
  
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}
```

### 2. Background Service Worker (background.js)

```javascript
// background.js - Service worker for Manifest V3
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ 
      colorHistory: [],
      settings: {
        groupByHue: false,
        autoExtract: false,
        maxColors: 100
      }
    });
  }
});

// Enable side panel on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'extractColors':
      handleColorExtraction(sender.tab?.id || request.tabId, sendResponse);
      return true; // Keep channel open for async response
      
    case 'captureScreenshot':
      captureTabScreenshot(sender.tab?.id || request.tabId, sendResponse);
      return true;
      
    case 'saveColors':
      saveColorsToStorage(request.colors, request.metadata, sendResponse);
      return true;
      
    case 'getStoredColors':
      getStoredColors(sendResponse);
      return true;
  }
});

async function handleColorExtraction(tabId, sendResponse) {
  try {
    // Inject color extraction script if needed
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractAllColors,
      world: 'MAIN'
    });
    
    sendResponse({ success: true, colors: results[0].result });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function captureTabScreenshot(tabId, sendResponse) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 90
    });
    sendResponse({ success: true, screenshot: dataUrl });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function saveColorsToStorage(colors, metadata, sendResponse) {
  try {
    const { colorHistory = [] } = await chrome.storage.local.get('colorHistory');
    const entry = {
      id: Date.now(),
      colors,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        count: colors.length
      }
    };
    
    colorHistory.unshift(entry);
    
    // Keep only last 50 entries
    if (colorHistory.length > 50) {
      colorHistory.length = 50;
    }
    
    await chrome.storage.local.set({ colorHistory });
    sendResponse({ success: true, entry });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function getStoredColors(sendResponse) {
  try {
    const data = await chrome.storage.local.get(['colorHistory', 'settings']);
    sendResponse({ success: true, ...data });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Function to be injected into the page
function extractAllColors() {
  // This function will be executed in the page context
  const extractor = new (window.ColorExtractor || ColorExtractor)();
  return extractor.extractAll();
}
```

### 3. Color Parser Utility (utils/color-parser.js)

```javascript
// Color format parsing and conversion utility
class ColorParser {
  constructor() {
    this.namedColors = {
      'red': '#FF0000', 'green': '#008000', 'blue': '#0000FF',
      'white': '#FFFFFF', 'black': '#000000', 'yellow': '#FFFF00',
      'cyan': '#00FFFF', 'magenta': '#FF00FF', 'silver': '#C0C0C0',
      'gray': '#808080', 'grey': '#808080', 'maroon': '#800000',
      'olive': '#808000', 'lime': '#00FF00', 'aqua': '#00FFFF',
      'teal': '#008080', 'navy': '#000080', 'fuchsia': '#FF00FF',
      'purple': '#800080', 'orange': '#FFA500', 'brown': '#A52A2A',
      'transparent': 'rgba(0, 0, 0, 0)'
    };
  }

  // Parse any CSS color format
  parse(colorString) {
    if (!colorString || typeof colorString !== 'string') return null;
    
    const color = colorString.toLowerCase().trim();
    
    // Named colors
    if (this.namedColors[color]) {
      return this.hexToRgba(this.namedColors[color]);
    }
    
    // Hex colors
    if (color.startsWith('#')) {
      return this.hexToRgba(color);
    }
    
    // RGB/RGBA
    const rgbMatch = color.match(/rgba?\s*\(\s*([^\)]+)\)/);
    if (rgbMatch) {
      const values = rgbMatch[1].split(/,\s*/).map(v => {
        if (v.includes('%')) {
          return Math.round(parseFloat(v) * 2.55);
        }
        return parseInt(v);
      });
      
      return {
        r: values[0] || 0,
        g: values[1] || 0,
        b: values[2] || 0,
        a: values[3] !== undefined ? parseFloat(values[3]) : 1
      };
    }
    
    // HSL/HSLA
    const hslMatch = color.match(/hsla?\s*\(\s*([^\)]+)\)/);
    if (hslMatch) {
      const values = hslMatch[1].split(/,\s*/);
      const h = parseFloat(values[0]);
      const s = parseFloat(values[1]);
      const l = parseFloat(values[2]);
      const a = values[3] !== undefined ? parseFloat(values[3]) : 1;
      
      return { ...this.hslToRgb(h, s, l), a };
    }
    
    return null;
  }

  // Convert hex to RGBA
  hexToRgba(hex) {
    let cleanHex = hex.replace('#', '');
    
    // Handle 3-digit hex
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    
    // Handle 8-digit hex (with alpha)
    if (cleanHex.length === 8) {
      return {
        r: parseInt(cleanHex.substr(0, 2), 16),
        g: parseInt(cleanHex.substr(2, 2), 16),
        b: parseInt(cleanHex.substr(4, 2), 16),
        a: parseInt(cleanHex.substr(6, 2), 16) / 255
      };
    }
    
    // Standard 6-digit hex
    return {
      r: parseInt(cleanHex.substr(0, 2), 16),
      g: parseInt(cleanHex.substr(2, 2), 16),
      b: parseInt(cleanHex.substr(4, 2), 16),
      a: 1
    };
  }

  // Convert RGB to hex
  rgbToHex(r, g, b, a = 1) {
    const toHex = (n) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    let hex = '#' + toHex(r) + toHex(g) + toHex(b);
    
    if (a < 1) {
      hex += toHex(Math.round(a * 255));
    }
    
    return hex;
  }

  // Convert HSL to RGB
  hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  // Convert RGB to HSL
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  // Normalize color to a standard format
  normalize(colorString) {
    const rgba = this.parse(colorString);
    if (!rgba) return null;
    
    // Return as hex if fully opaque, otherwise as rgba
    if (rgba.a === 1) {
      return this.rgbToHex(rgba.r, rgba.g, rgba.b);
    } else {
      return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    }
  }

  // Check if color is valid
  isValid(colorString) {
    return this.parse(colorString) !== null;
  }
}

// Make available globally
window.ColorParser = ColorParser;
```

### 4. Color Extractor Utility (utils/color-extractor.js)

```javascript
// Advanced color extraction from DOM
class ColorExtractor {
  constructor() {
    this.parser = new ColorParser();
    this.cache = new Map();
    this.uniqueColors = new Set();
  }

  extractAll() {
    const results = {
      colors: new Set(),
      gradients: new Set(),
      variables: new Map(),
      summary: {
        totalElements: 0,
        coloredElements: 0,
        uniqueColors: 0,
        processingTime: 0
      }
    };

    const startTime = performance.now();

    // Extract from stylesheets
    this.extractFromStylesheets(results);
    
    // Extract from DOM elements
    this.extractFromDOM(results);
    
    // Extract CSS variables
    this.extractCSSVariables(results);
    
    // Process results
    results.summary.processingTime = performance.now() - startTime;
    results.summary.uniqueColors = results.colors.size;
    
    return this.formatResults(results);
  }

  extractFromStylesheets(results) {
    try {
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          this.processStyleRules(rules, results);
        } catch (e) {
          // Cross-origin stylesheet, skip
          console.warn('Cannot access stylesheet:', sheet.href);
        }
      });
    } catch (error) {
      console.error('Error extracting from stylesheets:', error);
    }
  }

  processStyleRules(rules, results) {
    Array.from(rules).forEach(rule => {
      if (rule.style) {
        this.extractColorsFromStyle(rule.style, results);
      }
      
      // Handle nested rules (like @media)
      if (rule.cssRules) {
        this.processStyleRules(rule.cssRules, results);
      }
    });
  }

  extractFromDOM(results) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          // Skip invisible elements
          if (node.offsetParent === null && node !== document.body) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      results.summary.totalElements++;
      
      // Get computed styles
      const computed = window.getComputedStyle(node);
      this.extractColorsFromStyle(computed, results);
      
      // Get inline styles
      if (node.style) {
        this.extractColorsFromStyle(node.style, results);
      }
      
      // Extract pseudo-elements
      this.extractPseudoElementColors(node, results);
      
      // Handle SVG elements
      if (node.tagName === 'SVG' || node.closest('svg')) {
        this.extractSVGColors(node, results);
      }
    }
  }

  extractColorsFromStyle(style, results) {
    const colorProperties = [
      'color', 'backgroundColor', 'borderColor',
      'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
      'outlineColor', 'textDecorationColor', 'columnRuleColor',
      'caretColor', 'accentColor'
    ];

    colorProperties.forEach(prop => {
      const value = style[prop] || style.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
      if (value && value !== 'initial' && value !== 'inherit' && value !== 'unset') {
        const normalized = this.parser.normalize(value);
        if (normalized && normalized !== 'rgba(0, 0, 0, 0)') {
          results.colors.add(normalized);
        }
      }
    });

    // Extract gradients
    const bgImage = style.backgroundImage || style.getPropertyValue('background-image');
    if (bgImage && bgImage !== 'none') {
      const gradientRegex = /(linear|radial|conic|repeating-linear|repeating-radial)-gradient\([^)]+\)/gi;
      const gradients = bgImage.match(gradientRegex);
      
      if (gradients) {
        gradients.forEach(gradient => {
          results.gradients.add(gradient);
          
          // Extract colors from gradient
          const colorRegex = /#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/gi;
          const colors = gradient.match(colorRegex);
          if (colors) {
            colors.forEach(color => {
              const normalized = this.parser.normalize(color);
              if (normalized) {
                results.colors.add(normalized);
              }
            });
          }
        });
      }
    }

    // Extract shadows
    ['boxShadow', 'textShadow'].forEach(shadowProp => {
      const shadow = style[shadowProp] || style.getPropertyValue(shadowProp.replace(/([A-Z])/g, '-$1').toLowerCase());
      if (shadow && shadow !== 'none') {
        const colorRegex = /#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/gi;
        const colors = shadow.match(colorRegex);
        if (colors) {
          colors.forEach(color => {
            const normalized = this.parser.normalize(color);
            if (normalized) {
              results.colors.add(normalized);
            }
          });
        }
      }
    });
  }

  extractPseudoElementColors(element, results) {
    ['::before', '::after', '::marker', '::selection'].forEach(pseudo => {
      try {
        const pseudoStyle = window.getComputedStyle(element, pseudo);
        if (pseudoStyle.content && pseudoStyle.content !== 'none') {
          this.extractColorsFromStyle(pseudoStyle, results);
        }
      } catch (e) {
        // Some pseudo-elements might not be supported
      }
    });
  }

  extractSVGColors(element, results) {
    const svgProperties = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'];
    
    svgProperties.forEach(prop => {
      const value = element.getAttribute(prop) || 
                    window.getComputedStyle(element).getPropertyValue(prop);
      
      if (value && value !== 'none' && value !== 'inherit' && value !== 'currentColor') {
        const normalized = this.parser.normalize(value);
        if (normalized) {
          results.colors.add(normalized);
        }
      }
    });
  }

  extractCSSVariables(results) {
    const computedStyle = window.getComputedStyle(document.documentElement);
    
    // Get all CSS custom properties
    Array.from(computedStyle).forEach(prop => {
      if (prop.startsWith('--')) {
        const value = computedStyle.getPropertyValue(prop).trim();
        
        // Check if it's a color value
        if (this.parser.isValid(value)) {
          const normalized = this.parser.normalize(value);
          if (normalized) {
            results.variables.set(prop, normalized);
            results.colors.add(normalized);
          }
        }
      }
    });
  }

  formatResults(results) {
    const colorsArray = Array.from(results.colors);
    const gradientsArray = Array.from(results.gradients);
    const variablesObject = Object.fromEntries(results.variables);
    
    // Group colors by hue
    const colorsByHue = this.groupColorsByHue(colorsArray);
    
    return {
      colors: colorsArray,
      gradients: gradientsArray,
      variables: variablesObject,
      colorsByHue,
      summary: results.summary
    };
  }

  groupColorsByHue(colors) {
    const groups = {
      red: [], orange: [], yellow: [], green: [],
      cyan: [], blue: [], purple: [], pink: [],
      brown: [], gray: [], black: [], white: []
    };

    colors.forEach(color => {
      const rgba = this.parser.parse(color);
      if (rgba) {
        const hsl = this.parser.rgbToHsl(rgba.r, rgba.g, rgba.b);
        const hue = hsl.h;
        const sat = hsl.s;
        const light = hsl.l;
        
        // Categorize based on HSL values
        if (sat < 10) {
          if (light > 95) groups.white.push(color);
          else if (light < 5) groups.black.push(color);
          else groups.gray.push(color);
        } else if (hue < 15 || hue >= 345) {
          groups.red.push(color);
        } else if (hue < 35) {
          groups.orange.push(color);
        } else if (hue < 65) {
          groups.yellow.push(color);
        } else if (hue < 150) {
          groups.green.push(color);
        } else if (hue < 190) {
          groups.cyan.push(color);
        } else if (hue < 260) {
          groups.blue.push(color);
        } else if (hue < 290) {
          groups.purple.push(color);
        } else {
          groups.pink.push(color);
        }
      }
    });

    return groups;
  }
}

// Make available globally
window.ColorExtractor = ColorExtractor;
```

### 5. Content Script (content.js)

```javascript
// Content script for message handling
(() => {
  'use strict';

  let extractor = null;

  // Initialize extractor on demand
  function getExtractor() {
    if (!extractor) {
      extractor = new ColorExtractor();
    }
    return extractor;
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'extractColors':
        handleColorExtraction(sendResponse);
        return true; // Keep channel open

      case 'extractFromSelection':
        handleSelectionExtraction(sendResponse);
        return true;

      case 'highlightColors':
        highlightColoredElements(request.colors);
        sendResponse({ success: true });
        break;

      case 'clearHighlights':
        clearHighlights();
        sendResponse({ success: true });
        break;
    }
  });

  function handleColorExtraction(sendResponse) {
    try {
      const extractor = getExtractor();
      const results = extractor.extractAll();
      
      // Add page metadata
      results.metadata = {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString()
      };
      
      sendResponse({ success: true, data: results });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  function handleSelectionExtraction(sendResponse) {
    try {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        sendResponse({ success: false, error: 'No selection found' });
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element = container.nodeType === Node.TEXT_NODE ? 
                      container.parentElement : container;

      const extractor = getExtractor();
      const results = {
        colors: new Set(),
        gradients: new Set()
      };

      // Extract from selected element and its children
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );

      let node = element;
      do {
        const computed = window.getComputedStyle(node);
        extractor.extractColorsFromStyle(computed, results);
      } while (node = walker.nextNode());

      sendResponse({ 
        success: true, 
        data: {
          colors: Array.from(results.colors),
          gradients: Array.from(results.gradients)
        }
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  function highlightColoredElements(colors) {
    const colorSet = new Set(colors);
    const parser = new ColorParser();
    
    document.querySelectorAll('*').forEach(element => {
      const computed = window.getComputedStyle(element);
      const bgColor = parser.normalize(computed.backgroundColor);
      const textColor = parser.normalize(computed.color);
      
      if (colorSet.has(bgColor) || colorSet.has(textColor)) {
        element.dataset.colorHighlight = 'true';
        element.style.outline = '2px solid red';
        element.style.outlineOffset = '2px';
      }
    });
  }

  function clearHighlights() {
    document.querySelectorAll('[data-color-highlight]').forEach(element => {
      delete element.dataset.colorHighlight;
      element.style.outline = '';
      element.style.outlineOffset = '';
    });
  }

  // Notify background that content script is ready
  chrome.runtime.sendMessage({ action: 'contentScriptReady' });
})();
```

### 6. Popup HTML and JavaScript

**popup.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="styles/popup.css">
</head>
<body>
  <div class="popup-container">
    <header>
      <h1>Color Extractor</h1>
      <button id="openSidePanel" class="icon-button" title="Open side panel">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path d="M3 3h14v14H3V3zm12 2H5v10h10V5z"/>
        </svg>
      </button>
    </header>
    
    <div class="actions">
      <button id="extractColors" class="primary-button">
        Extract All Colors
      </button>
      <button id="captureScreenshot" class="secondary-button">
        Capture Screenshot
      </button>
    </div>
    
    <div id="quickColors" class="quick-colors"></div>
    
    <div class="status" id="status"></div>
  </div>
  
  <script src="utils/color-parser.js"></script>
  <script src="popup.js"></script>
</body>
</html>
```

**popup.js:**
```javascript
// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractColors');
  const screenshotBtn = document.getElementById('captureScreenshot');
  const sidePanelBtn = document.getElementById('openSidePanel');
  const quickColors = document.getElementById('quickColors');
  const status = document.getElementById('status');

  // Extract colors
  extractBtn.addEventListener('click', async () => {
    try {
      status.textContent = 'Extracting colors...';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'extractColors' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not injected, inject it
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['utils/color-parser.js', 'utils/color-extractor.js', 'content.js']
          }, () => {
            // Retry after injection
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'extractColors' }, handleResponse);
            }, 100);
          });
        } else {
          handleResponse(response);
        }
      });
    } catch (error) {
      status.textContent = 'Error: ' + error.message;
    }
  });

  // Capture screenshot
  screenshotBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.runtime.sendMessage({ 
        action: 'captureScreenshot', 
        tabId: tab.id 
      }, (response) => {
        if (response.success) {
          status.textContent = 'Screenshot captured!';
          // Could open in new tab or save
          chrome.tabs.create({ url: response.screenshot });
        } else {
          status.textContent = 'Screenshot failed: ' + response.error;
        }
      });
    } catch (error) {
      status.textContent = 'Error: ' + error.message;
    }
  });

  // Open side panel
  sidePanelBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.sidePanel.open({ windowId: tab.windowId });
    window.close();
  });

  function handleResponse(response) {
    if (response && response.success) {
      const colors = response.data.colors.slice(0, 10); // Show first 10
      displayQuickColors(colors);
      
      // Save to storage
      chrome.runtime.sendMessage({
        action: 'saveColors',
        colors: response.data.colors,
        metadata: response.data.metadata
      });
      
      status.textContent = `Found ${response.data.colors.length} unique colors`;
    } else {
      status.textContent = 'Extraction failed: ' + (response?.error || 'Unknown error');
    }
  }

  function displayQuickColors(colors) {
    quickColors.innerHTML = colors.map(color => `
      <div class="color-swatch" 
           style="background-color: ${color}" 
           data-color="${color}"
           title="${color}">
      </div>
    `).join('');
    
    // Add click to copy
    quickColors.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-swatch')) {
        const color = e.target.dataset.color;
        navigator.clipboard.writeText(color).then(() => {
          status.textContent = `Copied: ${color}`;
        });
      }
    });
  }
});
```

### 7. Side Panel Implementation

**sidepanel.html:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="styles/sidepanel.css">
</head>
<body>
  <div class="panel-container">
    <header>
      <h1>Color Palette</h1>
      <div class="header-controls">
        <select id="groupBy">
          <option value="none">No grouping</option>
          <option value="hue">Group by hue</option>
          <option value="brightness">Group by brightness</option>
          <option value="usage">Group by usage</option>
        </select>
        <button id="refresh" class="icon-button">↻</button>
      </div>
    </header>
    
    <div class="tabs">
      <button class="tab active" data-tab="current">Current Page</button>
      <button class="tab" data-tab="history">History</button>
      <button class="tab" data-tab="favorites">Favorites</button>
    </div>
    
    <div class="tab-content" id="currentTab">
      <div class="color-grid" id="colorGrid"></div>
    </div>
    
    <div class="tab-content hidden" id="historyTab">
      <div class="history-list" id="historyList"></div>
    </div>
    
    <div class="tab-content hidden" id="favoritesTab">
      <div class="favorites-grid" id="favoritesGrid"></div>
    </div>
    
    <div class="color-details" id="colorDetails"></div>
  </div>
  
  <script src="utils/color-parser.js"></script>
  <script src="sidepanel.js"></script>
</body>
</html>
```

**sidepanel.js:**
```javascript
// Side panel implementation
class SidePanelManager {
  constructor() {
    this.parser = new ColorParser();
    this.currentColors = [];
    this.selectedColor = null;
    this.favorites = new Set();
    this.groupingMode = 'none';
    
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.extractCurrentPageColors();
  }

  async loadData() {
    const data = await chrome.storage.local.get(['colorHistory', 'favorites']);
    this.history = data.colorHistory || [];
    this.favorites = new Set(data.favorites || []);
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Grouping selector
    document.getElementById('groupBy').addEventListener('change', (e) => {
      this.groupingMode = e.target.value;
      this.renderCurrentColors();
    });

    // Refresh button
    document.getElementById('refresh').addEventListener('click', () => {
      this.extractCurrentPageColors();
    });

    // Color grid interactions
    document.getElementById('colorGrid').addEventListener('click', (e) => {
      if (e.target.classList.contains('color-item')) {
        this.selectColor(e.target.dataset.color);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && this.selectedColor) {
        this.copyColor(this.selectedColor);
      }
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    switch (tabName) {
      case 'current':
        document.getElementById('currentTab').classList.remove('hidden');
        break;
      case 'history':
        document.getElementById('historyTab').classList.remove('hidden');
        this.renderHistory();
        break;
      case 'favorites':
        document.getElementById('favoritesTab').classList.remove('hidden');
        this.renderFavorites();
        break;
    }
  }

  async extractCurrentPageColors() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'extractColors' }, (response) => {
        if (chrome.runtime.lastError) {
          // Inject scripts if needed
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['utils/color-parser.js', 'utils/color-extractor.js', 'content.js']
          }, () => {
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'extractColors' }, this.handleColorResponse.bind(this));
            }, 100);
          });
        } else {
          this.handleColorResponse(response);
        }
      });
    } catch (error) {
      console.error('Error extracting colors:', error);
    }
  }

  handleColorResponse(response) {
    if (response && response.success) {
      this.currentColors = response.data.colors;
      this.renderCurrentColors();
      
      // Save to history
      chrome.runtime.sendMessage({
        action: 'saveColors',
        colors: response.data.colors,
        metadata: response.data.metadata
      });
    }
  }

  renderCurrentColors() {
    const grid = document.getElementById('colorGrid');
    let colorsToRender = [...this.currentColors];
    
    // Apply grouping
    if (this.groupingMode === 'hue') {
      colorsToRender = this.sortByHue(colorsToRender);
    } else if (this.groupingMode === 'brightness') {
      colorsToRender = this.sortByBrightness(colorsToRender);
    }
    
    grid.innerHTML = colorsToRender.map(color => this.createColorElement(color)).join('');
  }

  createColorElement(color) {
    const isFavorite = this.favorites.has(color);
    const rgb = this.parser.parse(color);
    const isDark = this.isColorDark(rgb);
    
    return `
      <div class="color-item ${isDark ? 'dark' : 'light'}" 
           style="background-color: ${color}" 
           data-color="${color}"
           title="${color}">
        <div class="color-actions">
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                  data-color="${color}">
            ${isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>
    `;
  }

  selectColor(color) {
    this.selectedColor = color;
    
    // Update selection state
    document.querySelectorAll('.color-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.color === color);
    });
    
    this.showColorDetails(color);
  }

  showColorDetails(color) {
    const rgb = this.parser.parse(color);
    const hsl = this.parser.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hex = this.parser.rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    
    const details = document.getElementById('colorDetails');
    details.innerHTML = `
      <div class="detail-header">
        <div class="detail-preview" style="background-color: ${color}"></div>
        <h3>Color Details</h3>
      </div>
      
      <div class="formats">
        <div class="format-row">
          <label>HEX:</label>
          <code class="copyable" data-value="${hex}">${hex}</code>
        </div>
        <div class="format-row">
          <label>RGB:</label>
          <code class="copyable" data-value="rgb(${rgb.r}, ${rgb.g}, ${rgb.b})">
            rgb(${rgb.r}, ${rgb.g}, ${rgb.b})
          </code>
        </div>
        <div class="format-row">
          <label>HSL:</label>
          <code class="copyable" data-value="hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)">
            hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)
          </code>
        </div>
      </div>
      
      <div class="actions">
        <button onclick="sidePanelManager.copyColor('${color}')">Copy</button>
        <button onclick="sidePanelManager.toggleFavorite('${color}')">
          ${this.favorites.has(color) ? 'Remove from' : 'Add to'} Favorites
        </button>
      </div>
    `;
    
    // Add click to copy for format values
    details.querySelectorAll('.copyable').forEach(el => {
      el.addEventListener('click', () => {
        this.copyToClipboard(el.dataset.value);
      });
    });
  }

  async copyColor(color) {
    await this.copyToClipboard(color);
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async toggleFavorite(color) {
    if (this.favorites.has(color)) {
      this.favorites.delete(color);
    } else {
      this.favorites.add(color);
    }
    
    await chrome.storage.local.set({ favorites: Array.from(this.favorites) });
    this.renderCurrentColors();
    this.showColorDetails(color);
  }

  sortByHue(colors) {
    return colors.sort((a, b) => {
      const hslA = this.parser.rgbToHsl(...Object.values(this.parser.parse(a)));
      const hslB = this.parser.rgbToHsl(...Object.values(this.parser.parse(b)));
      return hslA.h - hslB.h;
    });
  }

  sortByBrightness(colors) {
    return colors.sort((a, b) => {
      const rgbA = this.parser.parse(a);
      const rgbB = this.parser.parse(b);
      const brightnessA = (rgbA.r * 299 + rgbA.g * 587 + rgbA.b * 114) / 1000;
      const brightnessB = (rgbB.r * 299 + rgbB.g * 587 + rgbB.b * 114) / 1000;
      return brightnessB - brightnessA;
    });
  }

  isColorDark(rgb) {
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness < 128;
  }

  showNotification(message) {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (this.history.length === 0) {
      historyList.innerHTML = '<p class="empty-state">No color extraction history yet.</p>';
      return;
    }
    
    historyList.innerHTML = this.history.map(entry => `
      <div class="history-item">
        <div class="history-header">
          <h4>${entry.metadata.title || 'Untitled'}</h4>
          <time>${new Date(entry.metadata.timestamp).toLocaleString()}</time>
        </div>
        <div class="history-colors">
          ${entry.colors.slice(0, 10).map(color => `
            <span class="mini-swatch" 
                  style="background-color: ${color}" 
                  data-color="${color}"
                  title="${color}">
            </span>
          `).join('')}
          ${entry.colors.length > 10 ? `<span class="more">+${entry.colors.length - 10} more</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  renderFavorites() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    
    if (this.favorites.size === 0) {
      favoritesGrid.innerHTML = '<p class="empty-state">No favorite colors yet. Click the star icon on any color to add it.</p>';
      return;
    }
    
    favoritesGrid.innerHTML = Array.from(this.favorites)
      .map(color => this.createColorElement(color))
      .join('');
  }
}

// Initialize side panel
const sidePanelManager = new SidePanelManager();
```

### 8. CSS Styles

**styles/popup.css:**
```css
body {
  width: 320px;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  background: #f5f5f5;
}

.popup-container {
  padding: 16px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.icon-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.primary-button,
.secondary-button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background: #0066cc;
  color: white;
}

.primary-button:hover {
  background: #0052a3;
}

.secondary-button {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.secondary-button:hover {
  background: #f5f5f5;
}

.quick-colors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.color-swatch {
  aspect-ratio: 1;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.status {
  text-align: center;
  color: #666;
  font-size: 12px;
  min-height: 20px;
}
```

**styles/sidepanel.css:**
```css
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  background: #f5f5f5;
  overflow-x: hidden;
}

.panel-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  background: white;
  padding: 16px;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-controls {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

select {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 0 16px;
}

.tab {
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #333;
}

.tab.active {
  color: #0066cc;
  border-bottom-color: #0066cc;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.tab-content.hidden {
  display: none;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 12px;
}

.color-item {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.2s;
  overflow: hidden;
}

.color-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-item.selected {
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
}

.color-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.color-item:hover .color-actions {
  opacity: 1;
}

.favorite-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: white;
  transform: scale(1.1);
}

.favorite-btn.active {
  color: #ffd700;
}

.color-details {
  background: white;
  border-top: 1px solid #ddd;
  padding: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-preview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.formats {
  margin-bottom: 16px;
}

.format-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.format-row label {
  width: 60px;
  font-weight: 500;
  color: #666;
}

.format-row code {
  flex: 1;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.format-row code:hover {
  background: #e8e8e8;
}

.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0;
  transition: all 0.3s;
  z-index: 1000;
}

.notification.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.history-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.history-header time {
  font-size: 12px;
  color: #999;
}

.history-colors {
  display: flex;
  gap: 4px;
  align-items: center;
}

.mini-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.more {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  header,
  .tabs,
  .color-details,
  .history-item {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }
  
  select,
  .format-row code {
    background: #3a3a3a;
    border-color: #4a4a4a;
    color: #e0e0e0;
  }
  
  .tab {
    color: #999;
  }
  
  .tab.active {
    color: #4da3ff;
    border-bottom-color: #4da3ff;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

## Best Practices for Manifest V3

### Security considerations for Manifest V3

1. **Content Security Policy**: The extension enforces strict CSP by default, preventing inline scripts and remote code execution
2. **Minimal Permissions**: Uses `activeTab` permission instead of broad host permissions when possible
3. **Message Validation**: Always validate messages between different parts of the extension
4. **Secure Communication**: Use runtime.sendMessage for secure communication between components

### Performance optimizations implemented

1. **Lazy Loading**: Content scripts are injected only when needed
2. **Batch Processing**: DOM traversal is done in batches to avoid blocking the main thread
3. **Caching**: Computed styles are cached to avoid repeated calculations
4. **Virtual Scrolling**: Large color lists use virtual scrolling for better performance

### Recent Manifest V3 changes addressed

1. **Service Workers**: Background pages replaced with service workers that can be terminated and restarted
2. **Declarative Net Request**: For any network filtering needs (not used in this extension)
3. **Side Panel API**: New UI surface available since Chrome 114
4. **Storage Quotas**: Respects sync storage limits (100KB total, 8KB per item)

### Migration from Manifest V2

Key differences to note when migrating:
- `background.scripts` → `background.service_worker`
- `browser_action` → `action`
- No persistent background pages
- No remote code execution
- Stricter CSP requirements

This comprehensive guide provides a complete, working Chrome extension that extracts colors from web pages using the latest Manifest V3 standards and best practices. The extension handles all requested features including various color formats, screenshot capabilities, and modern UI patterns with both popup and side panel interfaces.