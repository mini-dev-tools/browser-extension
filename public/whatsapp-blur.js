(function() {
  class WhatsAppBlur {
    constructor() {
      this.settings = {
        allMessages: true,
        lastMessages: true,
        mediaPreview: true,
        mediaGallery: true,
        textInput: false,
        profilePictures: true,
        groupNames: true,
        noTransition: false,
        unblurOnHover: true
      };
      
      this.isActive = false;
      this.styleElement = null;
      this.hoverStyleElement = null;

      this.init();
    }

    async init() {
      // Load settings from storage
      if (chrome?.storage?.local) {
        const result = await chrome.storage.local.get(['whatsappBlurSettings', 'whatsappBlurActive']);
        if (result.whatsappBlurSettings) {
          this.settings = result.whatsappBlurSettings;
        }
        this.isActive = result.whatsappBlurActive || false;
      }

      // Apply blur if active
      if (this.isActive) {
        this.applyBlur();
      }

      // Listen for messages from extension
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.action === 'updateBlurSettings') {
            this.settings = request.settings;
            if (this.isActive) {
              this.applyBlur();
            }
          } else if (request.action === 'enableBlur') {
            this.settings = request.settings;
            this.isActive = true;
            this.applyBlur();
          } else if (request.action === 'disableBlur') {
            this.isActive = false;
            this.removeBlur();
          }
        });
      }

      // Watch for DOM changes to reapply blur
      this.observeDOM();
    }

    generateCSS() {
      const transition = this.settings.noTransition ? '' : 'transition: filter 0.3s ease, transform 0.3s ease;';
      let css = '';
      
      // Add base styles for rounded corners and softer blur
      css += `
        /* Base blur styles */
        .whatsapp-blur {
          border-radius: 12px !important;
          overflow: hidden !important;
        }
      `;

      // All messages in chat
      if (this.settings.allMessages) {
        css += `
          /* Chat messages */
          .selectable-text.copyable-text,
          ._ajv7,
          div[class*="message-in"],
          div[class*="message-out"],
          span[dir="ltr"],
          .x1n2onr6.x1n2onr6 {
            filter: blur(6px) !important;
            border-radius: 8px !important;
            ${transition}
          }
          
          /* Unblur on hover */
          .selectable-text.copyable-text:hover,
          ._ajv7:hover,
          div[class*="message-in"]:hover,
          div[class*="message-out"]:hover,
          span[dir="ltr"]:hover,
          .x1n2onr6.x1n2onr6:hover {
            filter: none !important;
            transform: scale(1.02) !important;
          }
        `;
      }

      // Last messages preview in chat list
      if (this.settings.lastMessages) {
        css += `
          /* Chat list message previews */
          [aria-label="Chat list"] [role="listitem"] span[title],
          [aria-label="Chat list"] .x1rg5ohu,
          ._ajv6 {
            filter: blur(5px) !important;
            border-radius: 6px !important;
            ${transition}
          }
          
          /* Unblur on hover */
          [aria-label="Chat list"] [role="listitem"]:hover span[title],
          [aria-label="Chat list"] [role="listitem"]:hover .x1rg5ohu,
          ._ajv6:hover {
            filter: none !important;
          }
        `;
      }

      // Media preview
      if (this.settings.mediaPreview) {
        css += `
          /* Media thumbnails */
          img.x1iyjqo2,
          [data-icon="status-image"],
          ._ajv7 img,
          div[class*="media-thumb"],
          .x15kfjtz,
          div[role="button"][aria-label*="picture"] img {
            filter: blur(8px) !important;
            border-radius: 12px !important;
            ${transition}
          }
          
          /* Media containers */
          div[role="button"][aria-label*="picture"],
          .x1n2onr6.xh8yej3 {
            border-radius: 12px !important;
            overflow: hidden !important;
          }
          
          /* Unblur on hover */
          img.x1iyjqo2:hover,
          [data-icon="status-image"]:hover,
          ._ajv7:hover img,
          div[class*="media-thumb"]:hover,
          .x15kfjtz:hover,
          div[role="button"][aria-label*="picture"]:hover img {
            filter: none !important;
            transform: scale(1.05) !important;
          }
        `;
      }

      // Media gallery
      if (this.settings.mediaGallery) {
        css += `
          /* Full size media */
          [data-testid="media-viewer"] img,
          [data-testid="media-viewer"] video,
          .media-viewer-thumbs img {
            filter: blur(10px) !important;
            border-radius: 16px !important;
            ${transition}
          }
          
          /* Unblur on hover */
          [data-testid="media-viewer"] img:hover,
          [data-testid="media-viewer"] video:hover,
          .media-viewer-thumbs img:hover {
            filter: none !important;
            transform: scale(1.02) !important;
          }
        `;
      }

      // Text input
      if (this.settings.textInput) {
        css += `
          /* Input fields */
          [role="textbox"],
          .lexical-rich-text-input,
          [contenteditable="true"],
          [aria-label="Type a message"] {
            filter: blur(5px) !important;
            border-radius: 8px !important;
            ${transition}
          }
          
          /* Unblur on hover or focus */
          [role="textbox"]:hover,
          [role="textbox"]:focus,
          .lexical-rich-text-input:hover,
          .lexical-rich-text-input:focus,
          [contenteditable="true"]:hover,
          [contenteditable="true"]:focus,
          [aria-label="Type a message"]:hover,
          [aria-label="Type a message"]:focus {
            filter: none !important;
          }
        `;
      }

      // Profile pictures
      if (this.settings.profilePictures) {
        css += `
          /* Profile images */
          img[src*="whatsapp.net"],
          div[aria-label*="Profile picture"] img,
          img._ao3e,
          .x1n2onr6.x1lliihq.xh8yej3 img,
          ._ajv2 {
            filter: blur(7px) !important;
            border-radius: 50% !important;
            ${transition}
          }
          
          /* Unblur on hover */
          img[src*="whatsapp.net"]:hover,
          div[aria-label*="Profile picture"]:hover img,
          img._ao3e:hover,
          .x1n2onr6.x1lliihq.xh8yej3:hover img,
          ._ajv2:hover {
            filter: none !important;
            transform: scale(1.1) !important;
          }
        `;
      }

      // Group/User names
      if (this.settings.groupNames) {
        css += `
          /* Contact and group names */
          [aria-label="Chat list"] [role="listitem"] span[dir="auto"]:first-child,
          .x1n2onr6.x14yjl9h.xudhj91.x18nykt9.xww2gxu,
          ._ajv4,
          header span[dir="auto"],
          [data-testid="conversation-info-header-chat-title"] {
            filter: blur(5px) !important;
            border-radius: 6px !important;
            padding: 2px 6px !important;
            ${transition}
          }
          
          /* Unblur on hover */
          [aria-label="Chat list"] [role="listitem"]:hover span[dir="auto"]:first-child,
          .x1n2onr6.x14yjl9h.xudhj91.x18nykt9.xww2gxu:hover,
          ._ajv4:hover,
          header span[dir="auto"]:hover,
          [data-testid="conversation-info-header-chat-title"]:hover {
            filter: none !important;
          }
        `;
      }

      return css;
    }

    generateHoverCSS() {
      if (!this.settings.unblurOnHover) return '';
      
      return `
        /* Unblur on hover */
        #app:hover * {
          filter: none !important;
        }
      `;
    }

    applyBlur() {
      // Remove existing styles
      this.removeBlur();

      // Create and inject main blur styles
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'whatsapp-blur-styles';
      this.styleElement.textContent = this.generateCSS();
      document.head.appendChild(this.styleElement);

      // Create and inject hover styles
      if (this.settings.unblurOnHover) {
        this.hoverStyleElement = document.createElement('style');
        this.hoverStyleElement.id = 'whatsapp-blur-hover-styles';
        this.hoverStyleElement.textContent = this.generateHoverCSS();
        document.head.appendChild(this.hoverStyleElement);
      }
    }

    removeBlur() {
      if (this.styleElement) {
        this.styleElement.remove();
        this.styleElement = null;
      }
      if (this.hoverStyleElement) {
        this.hoverStyleElement.remove();
        this.hoverStyleElement = null;
      }
    }

    observeDOM() {
      // Observe DOM changes to ensure blur persists
      const observer = new MutationObserver(() => {
        if (this.isActive && !document.getElementById('whatsapp-blur-styles')) {
          this.applyBlur();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // Initialize blur when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new WhatsAppBlur();
    });
  } else {
    new WhatsAppBlur();
  }
})();