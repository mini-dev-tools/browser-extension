declare const chrome: any;

export default function resizeWindow(width: number, height: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      const actions = ['resizeWindow', width, height];
      chrome.runtime.sendMessage({ action: actions }, function (response: any) {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (response?.status) {
          console.log('Window resized successfully');
          resolve(true);
        } else {
          console.error('Window resize failed:', response?.error);
          reject(new Error(response?.error || 'Unknown error'));
        }
      });
    } else {
      console.warn('Chrome extension API not available');
      reject(new Error('Chrome extension API not available'));
    }
  });
}