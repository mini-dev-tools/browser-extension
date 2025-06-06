(function() {
  'use strict';

  // Adaptive selector system with fallback strategies
  class WhatsAppBlurController {
    constructor() {
      this.selectors = {
        // Priority-ordered selector arrays
        messages: [
          '[data-testid="msg-container"] .selectable-text',
          '[data-testid="msg-container"] span.selectable-text',
          '.message-in .selectable-text, .message-out .selectable-text',
          'span[data-lexical-text="true"]',
          '.copyable-text.selectable-text',
          '._ajv7 .selectable-text',
          'div[class*="message-"] .selectable-text'
        ],
        
        chatList: [
          '[data-testid="chat-list"] [role="listitem"]',
          '#side [role="listitem"]',
          '#pane-side [role="row"]',
          '[aria-label="Chat list"] [role="listitem"]',
          '.x1qjc9v5 [role="listitem"]'
        ],
        
        profilePictures: [
          '[data-testid="avatar"]',
          'img[src*="ppdownload"]',
          'img[src*="whatsapp.net"]',
          'div[style*="background-image"] img',
          'img._ao3e',
          '.x1n2onr6.x1lliihq.xh8yej3 img',
          '._ajv2'
        ],
        
        contactNames: [
          '[data-testid="chat-list"] span[title]',
          '#side span[dir="auto"][title]',
          '[aria-label="Chat list"] span[dir="auto"]:first-child',
          '.chat-title span',
          '._ajv4',
          'header span[dir="auto"]',
          '[data-testid="conversation-info-header-chat-title"]'
        ],
        
        lastMessages: [
          '[data-testid="chat-list"] [role="listitem"] span[title]',
          '[aria-label="Chat list"] .x1rg5ohu',
          '#side [role="listitem"] span:last-child',
          '._ajv6',
          '.chat-secondary span'
        ],
        
        mediaContent: [
          '[data-testid="media-thumb"]',
          '[data-testid="msg-container"] img',
          '[data-testid="msg-container"] video',
          '.image-thumb-body img',
          'img.x1iyjqo2',
          '[data-icon="status-image"]',
          '._ajv7 img',
          'div[class*="media-thumb"]',
          '.x15kfjtz',
          'div[role="button"][aria-label*="picture"] img'
        ],
        
        mediaGallery: [
          '[data-testid="media-viewer"] img',
          '[data-testid="media-viewer"] video',
          '.media-viewer-thumbs img',
          '[data-animate-modal-backdrop="true"] img',
          '.modal-media img'
        ],
        
        inputFields: [
          '[data-testid="conversation-compose-box-input"]',
          '[contenteditable="true"][role="textbox"]',
          'div[contenteditable="true"][data-tab="1"]',
          '[aria-label*="Type a message"][contenteditable="true"]',
          '.lexical-rich-text-input'
        ],
        
        messagesContainer: [
          '[data-testid="conversation-panel-messages"]',
          '[data-testid="main"] [role="log"]',
          '.x1n2onr6.x78zum5.x1q0g3np',
          '#main [role="log"]'
        ],
        
        mainApp: [
          '[data-testid="app"]',
          '#app',
          '.app'
        ]
      };
      
      this.blurConfig = {
        allMessages: { enabled: true, intensity: 5, type: 'messages' },
        lastMessages: { enabled: true, intensity: 4, type: 'lastMessages' },
        profilePictures: { enabled: true, intensity: 8, type: 'profilePictures' },
        groupNames: { enabled: true, intensity: 4, type: 'contactNames' },
        mediaPreview: { enabled: true, intensity: 6, type: 'mediaContent' },
        mediaGallery: { enabled: true, intensity: 8, type: 'mediaGallery' },
        textInput: { enabled: false, intensity: 3, type: 'inputFields' }
      };
      
      this.behaviorConfig = {
        noTransition: false,
        unblurOnHover: true
      };
      
      this.isActive = false;
      this.blurredElements = new WeakSet();
      this.styleElement = null;
      this.observers = [];
      this.keyboardListenerAdded = false;
      
      this.init();
    }
    
    async init() {
      // Load saved preferences
      await this.loadPreferences();
      
      // Wait for WhatsApp to load
      await this.waitForWhatsApp();
      
      // Apply initial blur if active
      if (this.isActive) {
        this.applyBlur();
      }
      
      // Setup observers for dynamic content
      this.setupObservers();
      
      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();
      
      // Setup message listener for extension communication
      this.setupMessageListener();
      
      // Show status notification
      this.showStatus('WhatsApp Blur Controller Loaded');
    }
    
    waitForWhatsApp() {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          const mainApp = this.findElement('mainApp');
          const chatList = this.findElement('chatList');
          
          if (mainApp && (chatList || document.querySelector('[role="textbox"]'))) {
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
          if (element) {
            // Cache successful selector for future use
            this.cacheSuccessfulSelector(selectorType, selector);
            return element;
          }
        } catch (e) {
          console.warn(`WhatsApp Blur: Selector failed: ${selector}`, e);
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
          
          // Cache successful selector if it found elements
          if (found.length > 0) {
            this.cacheSuccessfulSelector(selectorType, selector);
          }
        } catch (e) {
          console.warn(`WhatsApp Blur: Selector failed: ${selector}`, e);
        }
      }
      
      return Array.from(elements);
    }
    
    cacheSuccessfulSelector(selectorType, selector) {
      // Move successful selector to front of array for next time
      const selectors = this.selectors[selectorType];
      const index = selectors.indexOf(selector);
      if (index > 0) {
        selectors.splice(index, 1);
        selectors.unshift(selector);
      }
    }
    
    applyBlur() {
      if (!this.isActive) return;
      
      // Remove existing styles first
      this.removeStyles();
      
      // Generate and inject CSS
      this.injectStyles();
      
      // Apply blur to elements using Intersection Observer for performance
      Object.keys(this.blurConfig).forEach(configKey => {
        const config = this.blurConfig[configKey];
        if (config.enabled) {
          this.blurElements(config.type, config.intensity);
        }
      });
    }
    
    blurElements(selectorType, intensity) {
      const elements = this.findAllElements(selectorType);
      
      elements.forEach(element => {
        if (!this.blurredElements.has(element)) {
          this.applyElementBlur(element, selectorType, intensity);
          this.blurredElements.add(element);
        }
      });
    }
    
    applyElementBlur(element, type, intensity) {
      element.classList.add('whatsapp-blur', `blur-${type}`);
      element.style.setProperty('--blur-intensity', `${intensity}px`);
      element.setAttribute('data-blur-applied', 'true');
      element.setAttribute('data-blur-type', type);
      
      // Add hover listeners for individual element reveal
      this.addHoverListeners(element, type);
    }
    
    addHoverListeners(element, type) {
      let hoverTimeout;
      
      const mouseEnterHandler = () => {
        if (this.behaviorConfig.unblurOnHover) return; // Skip if global hover is enabled
        
        hoverTimeout = setTimeout(() => {
          element.classList.add('blur-reveal');
        }, 100); // Small delay to prevent accidental reveals
      };
      
      const mouseLeaveHandler = () => {
        clearTimeout(hoverTimeout);
        element.classList.remove('blur-reveal');
      };
      
      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);
      
      // Store handlers for cleanup
      element._blurHandlers = { mouseEnterHandler, mouseLeaveHandler };
    }
    
    injectStyles() {
      const css = this.generateCSS();
      
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'whatsapp-blur-styles';
      this.styleElement.textContent = css;
      document.head.appendChild(this.styleElement);
    }
    
    generateCSS() {
      const transition = this.behaviorConfig.noTransition ? '' : 'transition: filter 0.3s ease-in-out, transform 0.2s ease-in-out !important;';
      
      let css = `
        /* Base blur styles */
        .whatsapp-blur {
          filter: blur(var(--blur-intensity, 5px)) !important;
          ${transition}
          position: relative !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }
        
        .whatsapp-blur.blur-reveal,
        .whatsapp-blur:hover {
          filter: none !important;
          transform: scale(1.02) !important;
        }
        
        /* Type-specific styles */
        .blur-messages {
          background: rgba(0, 0, 0, 0.02) !important;
          min-height: 1em !important;
        }
        
        .blur-profilePictures {
          border-radius: 50% !important;
        }
        
        .blur-mediaContent,
        .blur-mediaGallery {
          border-radius: 12px !important;
        }
        
        .blur-contactNames {
          padding: 2px 6px !important;
          border-radius: 6px !important;
        }
        
        .blur-inputFields {
          border-radius: 20px !important;
        }
        
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
          font-size: 16px;
          z-index: 1000;
        }
        
        .whatsapp-blur:hover::after {
          opacity: 0.3;
        }
        
        /* Media-specific handling */
        .blur-mediaContent img,
        .blur-mediaGallery img,
        .blur-mediaContent video,
        .blur-mediaGallery video {
          filter: inherit !important;
          border-radius: inherit !important;
        }
        
        /* Focus states for inputs */
        .blur-inputFields:focus,
        .blur-inputFields:focus-within {
          filter: none !important;
        }
      `;
      
      // Global hover to reveal all
      if (this.behaviorConfig.unblurOnHover) {
        css += `
          /* Global hover reveal */
          [data-testid="app"]:hover .whatsapp-blur,
          #app:hover .whatsapp-blur {
            filter: none !important;
          }
        `;
      }
      
      return css;
    }
    
    setupObservers() {
      // Cleanup existing observers
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];
      
      // Main content observer for new messages and dynamic content
      const mainObserver = new MutationObserver(
        this.debounce(() => {
          if (this.isActive) {
            this.applyBlur();
          }
        }, 200)
      );
      
      // Observe main containers
      const containers = [
        this.findElement('messagesContainer'),
        this.findElement('chatList'),
        this.findElement('mainApp')
      ].filter(Boolean);
      
      containers.forEach(container => {
        mainObserver.observe(container, {
          childList: true,
          subtree: true,
          attributes: false
        });
      });
      
      this.observers.push(mainObserver);
      
      // Performance-optimized observer for messages using Intersection Observer
      this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
      const messagesContainer = this.findElement('messagesContainer');
      if (!messagesContainer) return;
      
      const messageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.hasAttribute('data-blur-processed')) {
            this.processVisibleElement(entry.target);
            entry.target.setAttribute('data-blur-processed', 'true');
          }
        });
      }, {
        root: messagesContainer,
        threshold: 0.1,
        rootMargin: '100px'
      });
      
      // Observe existing message containers
      const messages = this.findAllElements('messages');
      messages.forEach(msg => {
        const container = msg.closest('[data-testid="msg-container"]');
        if (container) {
          messageObserver.observe(container);
        }
      });
      
      this.observers.push(messageObserver);
    }
    
    processVisibleElement(element) {
      if (!this.isActive) return;
      
      // Check if element contains blurable content
      Object.keys(this.blurConfig).forEach(configKey => {
        const config = this.blurConfig[configKey];
        if (config.enabled) {
          const childElements = element.querySelectorAll(this.selectors[config.type]?.join(', ') || '');
          childElements.forEach(child => {
            if (!this.blurredElements.has(child)) {
              this.applyElementBlur(child, config.type, config.intensity);
              this.blurredElements.add(child);
            }
          });
        }
      });
    }
    
    setupKeyboardShortcuts() {
      if (this.keyboardListenerAdded) return;
      
      const keyboardHandler = (e) => {
        // Alt+X to toggle all blur
        if (e.altKey && e.key === 'x') {
          e.preventDefault();
          this.toggleAllBlur();
        }
        
        // Alt+M to toggle message blur only
        if (e.altKey && e.key === 'm') {
          e.preventDefault();
          this.toggleBlurType('allMessages');
        }
        
        // Alt+I to toggle image blur
        if (e.altKey && e.key === 'i') {
          e.preventDefault();
          this.toggleBlurType('mediaPreview');
        }
        
        // Alt+N to toggle name blur
        if (e.altKey && e.key === 'n') {
          e.preventDefault();
          this.toggleBlurType('groupNames');
        }
      };
      
      document.addEventListener('keydown', keyboardHandler);
      this.keyboardListenerAdded = true;
    }
    
    setupMessageListener() {
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          switch (request.action) {
            case 'updateBlurSettings':
              this.updateSettings(request.settings);
              break;
            case 'enableBlur':
              this.updateSettings(request.settings);
              this.isActive = true;
              this.applyBlur();
              this.showStatus('Blur Enabled');
              break;
            case 'disableBlur':
              this.isActive = false;
              this.removeAllBlur();
              this.showStatus('Blur Disabled');
              break;
            case 'toggleBlur':
              this.toggleAllBlur();
              break;
          }
        });
      }
    }
    
    updateSettings(settings) {
      // Map settings from Vue component to internal config
      this.blurConfig.allMessages.enabled = settings.allMessages;
      this.blurConfig.lastMessages.enabled = settings.lastMessages;
      this.blurConfig.profilePictures.enabled = settings.profilePictures;
      this.blurConfig.groupNames.enabled = settings.groupNames;
      this.blurConfig.mediaPreview.enabled = settings.mediaPreview;
      this.blurConfig.mediaGallery.enabled = settings.mediaGallery;
      this.blurConfig.textInput.enabled = settings.textInput;
      
      this.behaviorConfig.noTransition = settings.noTransition;
      this.behaviorConfig.unblurOnHover = settings.unblurOnHover;
      
      if (this.isActive) {
        this.applyBlur();
      }
      
      this.savePreferences();
    }
    
    toggleAllBlur() {
      this.isActive = !this.isActive;
      
      if (this.isActive) {
        this.applyBlur();
        this.showStatus('Blur Enabled');
      } else {
        this.removeAllBlur();
        this.showStatus('Blur Disabled');
      }
      
      this.savePreferences();
    }
    
    toggleBlurType(configKey) {
      if (this.blurConfig[configKey]) {
        this.blurConfig[configKey].enabled = !this.blurConfig[configKey].enabled;
        
        if (this.isActive) {
          if (this.blurConfig[configKey].enabled) {
            this.blurElements(this.blurConfig[configKey].type, this.blurConfig[configKey].intensity);
          } else {
            this.removeBlurType(this.blurConfig[configKey].type);
          }
        }
        
        this.showStatus(`${configKey} ${this.blurConfig[configKey].enabled ? 'Enabled' : 'Disabled'}`);
        this.savePreferences();
      }
    }
    
    removeAllBlur() {
      this.removeStyles();
      
      document.querySelectorAll('.whatsapp-blur').forEach(element => {
        this.removeElementBlur(element);
      });
      
      this.blurredElements = new WeakSet();
    }
    
    removeBlurType(type) {
      document.querySelectorAll(`[data-blur-type="${type}"]`).forEach(element => {
        this.removeElementBlur(element);
      });
    }
    
    removeElementBlur(element) {
      element.classList.remove('whatsapp-blur', 'blur-reveal');
      element.removeAttribute('data-blur-applied');
      element.removeAttribute('data-blur-type');
      element.style.removeProperty('--blur-intensity');
      
      // Remove event listeners
      if (element._blurHandlers) {
        element.removeEventListener('mouseenter', element._blurHandlers.mouseEnterHandler);
        element.removeEventListener('mouseleave', element._blurHandlers.mouseLeaveHandler);
        delete element._blurHandlers;
      }
      
      // Remove from blur tracking
      if (this.blurredElements.has(element)) {
        this.blurredElements.delete(element);
      }
    }
    
    removeStyles() {
      if (this.styleElement) {
        this.styleElement.remove();
        this.styleElement = null;
      }
    }
    
    async savePreferences() {
      if (chrome?.storage?.local) {
        const settings = {
          allMessages: this.blurConfig.allMessages.enabled,
          lastMessages: this.blurConfig.lastMessages.enabled,
          profilePictures: this.blurConfig.profilePictures.enabled,
          groupNames: this.blurConfig.groupNames.enabled,
          mediaPreview: this.blurConfig.mediaPreview.enabled,
          mediaGallery: this.blurConfig.mediaGallery.enabled,
          textInput: this.blurConfig.textInput.enabled,
          noTransition: this.behaviorConfig.noTransition,
          unblurOnHover: this.behaviorConfig.unblurOnHover
        };
        
        await chrome.storage.local.set({ 
          whatsappBlurSettings: settings,
          whatsappBlurActive: this.isActive 
        });
      }
    }
    
    async loadPreferences() {
      if (chrome?.storage?.local) {
        const data = await chrome.storage.local.get(['whatsappBlurSettings', 'whatsappBlurActive']);
        
        if (data.whatsappBlurSettings) {
          this.updateSettings(data.whatsappBlurSettings);
        }
        
        this.isActive = data.whatsappBlurActive || false;
      }
    }
    
    showStatus(message) {
      let status = document.getElementById('whatsapp-blur-status');
      if (!status) {
        status = document.createElement('div');
        status.id = 'whatsapp-blur-status';
        status.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          z-index: 999999;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(status);
      }
      
      status.textContent = message;
      status.style.display = 'block';
      
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
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
    
    // Cleanup method for extension reload
    destroy() {
      this.observers.forEach(observer => observer.disconnect());
      this.removeAllBlur();
      
      // Remove status element
      const status = document.getElementById('whatsapp-blur-status');
      if (status) status.remove();
    }
  }

  // Initialize the blur controller
  let blurController;
  
  function initializeBlur() {
    // Cleanup existing instance
    if (blurController) {
      blurController.destroy();
    }
    
    blurController = new WhatsAppBlurController();
    
    // Make it globally accessible for debugging
    window.whatsappBlurController = blurController;
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBlur);
  } else {
    initializeBlur();
  }
  
  // Handle extension context invalidation
  if (chrome?.runtime?.onConnect) {
    chrome.runtime.onConnect.addListener(() => {
      // Extension context is still valid
    });
  }
})();