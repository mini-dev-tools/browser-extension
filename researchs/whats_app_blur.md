# WhatsApp Web Privacy Blur Feature: Complete Implementation Guide (2025)

WhatsApp Web's dynamic React architecture and frequent updates require adaptive selector strategies and robust implementation patterns for reliable DOM manipulation in 2025.

## Current WhatsApp Web DOM Structure and Reliable Selectors

WhatsApp Web uses **heavily obfuscated CSS classes** generated through CSS Modules, with class names following patterns like `_3FeAD`, `_3u328`, combined with semantic descriptors like `copyable-text` and `selectable-text`. These classes change frequently with each build, making them unreliable for long-term use.

### Most Stable Selectors (Priority Order)

**1. Data-TestId Attributes (Highest Reliability)**
```javascript
const reliableSelectors = {
  // Core UI containers
  mainApp: '[data-testid="app"]',
  sidebar: '[data-testid="side"]',
  chatList: '[data-testid="chat-list"]',
  conversationPanel: '[data-testid="conversation-panel-wrapper"]',
  
  // Message elements
  messagesContainer: '[data-testid="conversation-panel-messages"]',
  messageContainer: '[data-testid="msg-container"]',
  messageMeta: '[data-testid="msg-meta"]',
  
  // Input elements
  messageInput: '[data-testid="conversation-compose-box-input"]',
  sendButton: '[data-testid="send"]',
  
  // Search and navigation
  searchBox: '[data-testid="chat-list-search"]',
  menuButton: '[data-testid="menu"]',
  
  // Media elements
  mediaThumb: '[data-testid="media-thumb"]',
  mediaViewer: '[data-testid="media-viewer"]'
};
```

**2. ARIA Labels and Semantic Selectors**
```javascript
const ariaSelectors = {
  // Stable accessibility attributes
  messageInput: '[aria-label*="Type a message"][contenteditable="true"]',
  chatList: '[aria-label*="Chat list"]',
  sendButton: '[role="button"][aria-label*="Send"]',
  
  // Role-based selectors
  messages: '[role="log"] [role="row"]',
  textbox: '[role="textbox"]',
  listItems: '[role="listitem"]',
  
  // Combined semantic patterns
  chatItems: '#side [role="listitem"]',
  messageText: '[data-testid="msg-container"] .selectable-text'
};
```

**3. Structural and Content-Based Fallbacks**
```javascript
const fallbackSelectors = {
  // Parent-child relationships
  profilePictures: 'img[src*="ppdownload"]',
  contactNames: 'span[dir="auto"][title]',
  lastMessage: '[data-testid="chat-list"] [role="listitem"] span[title]',
  
  // Content-editable patterns
  inputField: 'div[contenteditable="true"][data-tab="1"]',
  
  // Media gallery patterns
  mediaGallery: '[data-animate-modal-backdrop="true"]',
  imageInChat: '[data-testid="msg-container"] img'
};
```

## Complete Privacy Blur Implementation

### Chrome Extension Approach (Manifest V3)

**manifest.json:**
```json
{
  "manifest_version": 3,
  "name": "WhatsApp Web Privacy Blur",
  "version": "1.0.0",
  "description": "Blur sensitive content on WhatsApp Web with hover-to-reveal",
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://web.whatsapp.com/*"],
  "content_scripts": [{
    "matches": ["https://web.whatsapp.com/*"],
    "js": ["content.js"],
    "css": ["blur-styles.css"],
    "run_at": "document_idle"
  }],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png"
    }
  }
}
```

**content.js - Adaptive Blur System:**
```javascript
// Adaptive selector system with fallback strategies
class WhatsAppBlurController {
  constructor() {
    this.selectors = {
      // Priority-ordered selector arrays
      messages: [
        '[data-testid="msg-container"] .selectable-text',
        '.message-in .selectable-text, .message-out .selectable-text',
        'span[data-lexical-text="true"]',
        '.copyable-text.selectable-text'
      ],
      
      chatList: [
        '[data-testid="chat-list"] [role="listitem"]',
        '#side [role="listitem"]',
        '#pane-side [role="row"]'
      ],
      
      profilePictures: [
        '[data-testid="avatar"]',
        'img[src*="ppdownload"]',
        'div[style*="background-image"] img'
      ],
      
      contactNames: [
        '[data-testid="chat-list"] span[title]',
        '#side span[dir="auto"][title]',
        '.chat-title span'
      ],
      
      mediaContent: [
        '[data-testid="media-thumb"]',
        '[data-testid="msg-container"] img',
        '[data-testid="msg-container"] video',
        '.image-thumb-body img'
      ],
      
      inputFields: [
        '[data-testid="conversation-compose-box-input"]',
        '[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"][data-tab="1"]'
      ]
    };
    
    this.blurConfig = {
      messages: { enabled: true, intensity: 5 },
      chatList: { enabled: true, intensity: 4 },
      profilePictures: { enabled: true, intensity: 8 },
      contactNames: { enabled: true, intensity: 4 },
      mediaContent: { enabled: true, intensity: 6 },
      inputFields: { enabled: false, intensity: 3 }
    };
    
    this.init();
  }
  
  async init() {
    // Load saved preferences
    await this.loadPreferences();
    
    // Wait for WhatsApp to load
    await this.waitForWhatsApp();
    
    // Apply initial blur
    this.applyBlur();
    
    // Setup observers for dynamic content
    this.setupObservers();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }
  
  waitForWhatsApp() {
    return new Promise((resolve) => {
      const checkLoaded = () => {
        const mainApp = document.querySelector('[data-testid="app"]') || 
                       document.querySelector('#app');
        
        if (mainApp && this.findElement('chatList')) {
          resolve();
        } else {
          setTimeout(checkLoaded, 500);
        }
      };
      checkLoaded();
    });
  }
  
  findElement(selectorType) {
    const selectors = this.selectors[selectorType];
    if (!selectors) return null;
    
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) return element;
      } catch (e) {
        console.warn(`Selector failed: ${selector}`, e);
      }
    }
    return null;
  }
  
  findAllElements(selectorType) {
    const selectors = this.selectors[selectorType];
    if (!selectors) return [];
    
    const elements = new Set();
    
    for (const selector of selectors) {
      try {
        const found = document.querySelectorAll(selector);
        found.forEach(el => elements.add(el));
      } catch (e) {
        console.warn(`Selector failed: ${selector}`, e);
      }
    }
    
    return Array.from(elements);
  }
  
  applyBlur() {
    Object.keys(this.blurConfig).forEach(type => {
      if (this.blurConfig[type].enabled) {
        this.blurElements(type);
      }
    });
  }
  
  blurElements(type) {
    const elements = this.findAllElements(type);
    const intensity = this.blurConfig[type].intensity;
    
    elements.forEach(element => {
      if (!element.hasAttribute('data-blur-applied')) {
        element.classList.add('whatsapp-blur', `blur-${type}`);
        element.style.setProperty('--blur-intensity', `${intensity}px`);
        element.setAttribute('data-blur-applied', 'true');
        
        // Add hover listeners for reveal
        this.addHoverListeners(element, type);
      }
    });
  }
  
  addHoverListeners(element, type) {
    let hoverTimeout;
    
    element.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        element.classList.add('blur-reveal');
      }, 100); // Small delay to prevent accidental reveals
    });
    
    element.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      element.classList.remove('blur-reveal');
    });
  }
  
  setupObservers() {
    // Optimized observer for new content
    const observer = new MutationObserver(
      this.debounce(() => {
        this.applyBlur();
      }, 200)
    );
    
    // Observe main containers
    const containers = [
      this.findElement('messagesContainer'),
      this.findElement('chatList')
    ].filter(Boolean);
    
    containers.forEach(container => {
      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: false
      });
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt+X to toggle all blur
      if (e.altKey && e.key === 'x') {
        this.toggleAllBlur();
      }
      
      // Alt+M to toggle message blur only
      if (e.altKey && e.key === 'm') {
        this.toggleBlurType('messages');
      }
    });
  }
  
  toggleAllBlur() {
    const anyEnabled = Object.values(this.blurConfig).some(c => c.enabled);
    
    Object.keys(this.blurConfig).forEach(type => {
      this.blurConfig[type].enabled = !anyEnabled;
    });
    
    if (!anyEnabled) {
      this.applyBlur();
    } else {
      this.removeAllBlur();
    }
    
    this.savePreferences();
  }
  
  toggleBlurType(type) {
    this.blurConfig[type].enabled = !this.blurConfig[type].enabled;
    
    if (this.blurConfig[type].enabled) {
      this.blurElements(type);
    } else {
      this.removeBlurType(type);
    }
    
    this.savePreferences();
  }
  
  removeAllBlur() {
    document.querySelectorAll('.whatsapp-blur').forEach(element => {
      element.classList.remove('whatsapp-blur', 'blur-reveal');
      element.removeAttribute('data-blur-applied');
      element.style.removeProperty('--blur-intensity');
    });
  }
  
  removeBlurType(type) {
    document.querySelectorAll(`.blur-${type}`).forEach(element => {
      element.classList.remove('whatsapp-blur', `blur-${type}`, 'blur-reveal');
      element.removeAttribute('data-blur-applied');
      element.style.removeProperty('--blur-intensity');
    });
  }
  
  async savePreferences() {
    if (chrome.storage) {
      await chrome.storage.local.set({ blurConfig: this.blurConfig });
    }
  }
  
  async loadPreferences() {
    if (chrome.storage) {
      const data = await chrome.storage.local.get('blurConfig');
      if (data.blurConfig) {
        this.blurConfig = { ...this.blurConfig, ...data.blurConfig };
      }
    }
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize the blur controller
const blurController = new WhatsAppBlurController();
```

**blur-styles.css:**
```css
/* Blur styles with smooth transitions */
.whatsapp-blur {
  filter: blur(var(--blur-intensity, 5px)) !important;
  transition: filter 0.2s ease-in-out !important;
  cursor: pointer !important;
  position: relative !important;
}

.whatsapp-blur.blur-reveal,
.whatsapp-blur:hover {
  filter: none !important;
}

/* Type-specific blur intensities */
.blur-messages { --blur-intensity: 5px; }
.blur-chatList { --blur-intensity: 4px; }
.blur-profilePictures { --blur-intensity: 8px; }
.blur-contactNames { --blur-intensity: 4px; }
.blur-mediaContent { --blur-intensity: 6px; }
.blur-inputFields { --blur-intensity: 3px; }

/* Hover indicator */
.whatsapp-blur::after {
  content: "👁";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  font-size: 20px;
}

.whatsapp-blur:hover::after {
  opacity: 0.3;
}

/* Global hover to reveal all */
body.reveal-all .whatsapp-blur {
  filter: none !important;
}

/* Media-specific handling */
[data-testid="media-thumb"].whatsapp-blur img,
[data-testid="msg-container"].whatsapp-blur img {
  filter: inherit !important;
}

/* Preserve text readability indicators */
.whatsapp-blur[data-testid="msg-container"] {
  min-height: 1.5em;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 7.5px;
  padding: 2px 4px;
}
```

### Tampermonkey Userscript Alternative

```javascript
// ==UserScript==
// @name         WhatsApp Web Privacy Blur
// @namespace    https://github.com/yourusername/
// @version      1.0.0
// @description  Blur sensitive WhatsApp Web content with hover reveal
// @author       Your Name
// @match        https://web.whatsapp.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    
    // Inject CSS styles
    GM_addStyle(`
        .wa-blur {
            filter: blur(var(--intensity, 5px)) !important;
            transition: filter 0.2s ease !important;
        }
        
        .wa-blur:hover {
            filter: none !important;
        }
        
        /* Quick toggle indicator */
        #blur-status {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            z-index: 9999;
            display: none;
        }
    `);
    
    // Configuration with cascade selectors
    const config = {
        selectors: {
            messages: [
                '[data-testid="msg-container"] span.selectable-text',
                '.message-in .selectable-text',
                '.message-out .selectable-text',
                'span[data-lexical-text="true"]'
            ],
            chatPreviews: [
                '[data-testid="chat-list"] [role="listitem"] span[title]',
                '#side [role="listitem"] .chat-title',
                '#pane-side span[dir="auto"]'
            ],
            profilePics: [
                'img[data-testid="avatar"]',
                'img[src*="ppdownload"]',
                '[data-testid="chat-list"] img'
            ],
            media: [
                '[data-testid="media-thumb"]',
                '[data-testid="image-thumb"]',
                '.media-thumb img',
                '[data-testid="msg-container"] img',
                '[data-testid="msg-container"] video'
            ]
        },
        
        intensities: {
            messages: 5,
            chatPreviews: 4,
            profilePics: 8,
            media: 6
        }
    };
    
    // Main blur controller
    class BlurManager {
        constructor() {
            this.enabled = GM_getValue('blurEnabled', true);
            this.blurredElements = new WeakSet();
            this.init();
        }
        
        async init() {
            await this.waitForWhatsApp();
            this.applyBlur();
            this.setupObserver();
            this.setupKeyboardShortcuts();
            this.showStatus('WhatsApp Blur Loaded - Press Alt+X to toggle');
        }
        
        waitForWhatsApp() {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (document.querySelector('[data-testid="app"]')) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 500);
            });
        }
        
        findElements(selectorArray) {
            const elements = new Set();
            
            for (const selector of selectorArray) {
                try {
                    document.querySelectorAll(selector).forEach(el => elements.add(el));
                } catch (e) {
                    console.warn(`Failed selector: ${selector}`);
                }
            }
            
            return Array.from(elements);
        }
        
        applyBlur() {
            if (!this.enabled) return;
            
            Object.entries(config.selectors).forEach(([type, selectors]) => {
                const elements = this.findElements(selectors);
                const intensity = config.intensities[type];
                
                elements.forEach(element => {
                    if (!this.blurredElements.has(element)) {
                        element.classList.add('wa-blur');
                        element.style.setProperty('--intensity', `${intensity}px`);
                        this.blurredElements.add(element);
                    }
                });
            });
        }
        
        removeBlur() {
            document.querySelectorAll('.wa-blur').forEach(element => {
                element.classList.remove('wa-blur');
                element.style.removeProperty('--intensity');
            });
            this.blurredElements = new WeakSet();
        }
        
        toggle() {
            this.enabled = !this.enabled;
            GM_setValue('blurEnabled', this.enabled);
            
            if (this.enabled) {
                this.applyBlur();
                this.showStatus('Blur Enabled');
            } else {
                this.removeBlur();
                this.showStatus('Blur Disabled');
            }
        }
        
        setupObserver() {
            const observer = new MutationObserver(() => {
                if (this.enabled) {
                    requestAnimationFrame(() => this.applyBlur());
                }
            });
            
            // Observe main message and chat containers
            const containers = [
                document.querySelector('[data-testid="conversation-panel-messages"]'),
                document.querySelector('[data-testid="chat-list"]')
            ].filter(Boolean);
            
            containers.forEach(container => {
                observer.observe(container, {
                    childList: true,
                    subtree: true
                });
            });
        }
        
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (e.altKey && e.key === 'x') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
        
        showStatus(message) {
            let status = document.getElementById('blur-status');
            if (!status) {
                status = document.createElement('div');
                status.id = 'blur-status';
                document.body.appendChild(status);
            }
            
            status.textContent = message;
            status.style.display = 'block';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 2000);
        }
    }
    
    // Initialize blur manager
    const blurManager = new BlurManager();
})();
```

## Handling WhatsApp Web's Challenges

### Dynamic Content and Virtual Scrolling

WhatsApp Web uses **virtual scrolling** for performance, rendering only visible messages. This requires special handling:

```javascript
// Intersection Observer for efficient processing
const messageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.hasAttribute('data-blur-processed')) {
      applyBlurToElement(entry.target);
      entry.target.setAttribute('data-blur-processed', 'true');
    }
  });
}, {
  root: document.querySelector('[data-testid="conversation-panel-messages"]'),
  threshold: 0.1
});

// Observe all message containers
document.querySelectorAll('[data-testid="msg-container"]').forEach(msg => {
  messageObserver.observe(msg);
});
```

### React Component Updates

WhatsApp Web's React architecture requires monitoring for component re-renders:

```javascript
// React Fiber detection for component updates
function monitorReactUpdates() {
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook && hook.onCommitFiberRoot) {
    const original = hook.onCommitFiberRoot;
    hook.onCommitFiberRoot = function(id, root) {
      // Re-apply blur after React updates
      setTimeout(() => blurController.applyBlur(), 100);
      return original.apply(this, arguments);
    };
  }
}
```

### Selector Resilience Strategy

Implement a cascade selector system that tries multiple approaches:

```javascript
class CascadeSelector {
  static find(selectors, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      function attempt() {
        for (const selector of selectors) {
          try {
            const element = document.querySelector(selector);
            if (element) {
              console.log(`Found element with selector: ${selector}`);
              resolve({ element, selector });
              return;
            }
          } catch (e) {
            // Invalid selector, skip
          }
        }
        
        if (Date.now() - startTime < timeout) {
          requestAnimationFrame(attempt);
        } else {
          reject(new Error('Element not found with any selector'));
        }
      }
      
      attempt();
    });
  }
}
```

## Best Practices and Recommendations

**1. Prioritize Stable Selectors**
- Always use `data-testid` attributes first
- Fall back to ARIA labels and semantic roles
- Avoid CSS class selectors except as last resort

**2. Implement Adaptive Detection**
- Monitor which selectors succeed and prioritize them
- Log selector failures to detect WhatsApp updates
- Maintain version-aware selector strategies

**3. Performance Optimization**
- Use Intersection Observer for large lists
- Debounce mutation observers
- Process elements in batches using requestIdleCallback

**4. User Experience**
- Provide visual feedback for blur state
- Implement smooth transitions
- Allow granular control over what to blur

**5. Maintain Compatibility**
- Test across WhatsApp Web updates
- Monitor GitHub issues for selector changes
- Implement automatic fallback mechanisms

This comprehensive approach ensures your privacy blur feature remains functional despite WhatsApp Web's frequent updates and complex React architecture. The combination of stable selectors, adaptive strategies, and robust error handling creates a resilient solution that works as both a Chrome extension and Tampermonkey userscript.