/**
 * Screenshot Service for Chrome Extension with Manifest V3 support
 * Handles multiple capture types: page screenshot, screen recording, tab recording
 */

export interface ScreenshotResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export type CaptureType = 'screenshot' | 'screen' | 'tab';

export class ScreenshotService {
  /**
   * Captures a tab screenshot (visible area only)
   */
  static async captureTabScreenshot(): Promise<ScreenshotResponse> {
    console.log('ScreenshotService: Starting tab screenshot...');
    
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'Chrome extension APIs not available'
        };
      }

      // Use simple tab capture for visible area only
      return await this.sendToBackground('SIMPLE_TAB_SCREENSHOT');
      
    } catch (error) {
      console.error('ScreenshotService: Tab screenshot error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Captures a full page screenshot (entire page including below the fold)
   */
  static async captureFullPageScreenshot(): Promise<ScreenshotResponse> {
    console.log('ScreenshotService: Starting full page screenshot...');
    
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'Chrome extension APIs not available'
        };
      }

      // Use full page capture with scrolling
      return await this.sendToBackground('FULL_PAGE_SCREENSHOT');
      
    } catch (error) {
      console.error('ScreenshotService: Full page screenshot error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Starts screen recording using desktop capture
   */
  static async captureScreen(): Promise<ScreenshotResponse> {
    console.log('ScreenshotService: Starting screen recording...');
    
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'Chrome extension APIs not available'
        };
      }

      return await this.sendToBackground('startScreenCapture');
      
    } catch (error) {
      console.error('ScreenshotService: Screen recording error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Starts tab recording using tab capture
   */
  static async captureTab(): Promise<ScreenshotResponse> {
    console.log('ScreenshotService: Starting tab recording...');
    
    try {
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'Chrome extension APIs not available'
        };
      }

      return await this.sendToBackground('startTabCapture');
      
    } catch (error) {
      console.error('ScreenshotService: Tab recording error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Modern capture using getDisplayMedia (works in popup context)
   */
  private static async useGetDisplayMedia(): Promise<ScreenshotResponse> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: true
      });

      // Create MediaRecorder for recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      const chunks: BlobPart[] = [];

      return new Promise((resolve) => {
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          this.downloadFile(blob, 'screen-capture', 'webm');
          resolve({ success: true, message: 'Screen capture saved successfully' });
        };

        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          resolve({ success: false, error: 'Recording failed' });
        };

        // Start recording
        mediaRecorder.start();

        // Stop when user stops sharing
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          console.log('User stopped sharing, ending recording');
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        });

        // Auto-stop after 5 minutes
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            console.log('Auto-stopping recording after 5 minutes');
            mediaRecorder.stop();
          }
        }, 5 * 60 * 1000);
      });

    } catch (error) {
      console.error('getDisplayMedia error:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        return { success: false, error: 'User denied screen sharing permission' };
      }
      return { success: false, error: 'Failed to start screen capture' };
    }
  }

  /**
   * Send message to background script
   */
  private static async sendToBackground(type: string): Promise<ScreenshotResponse> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type }, (response: ScreenshotResponse) => {
        if ((chrome.runtime as any).lastError) {
          console.error('Background message error:', (chrome.runtime as any).lastError);
          resolve({
            success: false,
            error: (chrome.runtime as any).lastError.message
          });
        } else {
          resolve(response || { success: false, error: 'No response from background script' });
        }
      });
    });
  }

  /**
   * Download file helper
   */
  private static downloadFile(blob: Blob, prefix: string, extension: string) {
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `${prefix}-${timestamp}.${extension}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.log('Downloaded:', filename);
  }

  /**
   * Checks if the screenshot functionality is available
   */
  static isAvailable(): boolean {
    return typeof chrome !== 'undefined' && 
           !!chrome.runtime && 
           !!chrome.runtime.sendMessage;
  }

  /**
   * Legacy method for backward compatibility - captures full page
   */
  static async captureFullPage(): Promise<ScreenshotResponse> {
    return await this.captureFullPageScreenshot();
  }

  /**
   * Legacy method for backward compatibility - captures visible area only
   */
  static async capturePageScreenshot(): Promise<ScreenshotResponse> {
    return await this.captureTabScreenshot();
  }
}