/**
 * Chrome-Ex Content Script
 * Tracks clicks globally across all pages for distraction counter
 */

// Track clicks on this page
document.addEventListener('click', () => {
  // Send click event to service worker
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ type: 'CLICK_TRACKED' }).catch(() => {
      // Ignore errors if extension context is invalidated
    });
  }
}, true); // Use capture phase to catch all clicks

console.log('Chrome-Ex: Click tracking active');
