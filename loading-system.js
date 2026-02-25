/**
 * Reusable Loading Transition System
 * Provides smooth loading transitions with a centered loading GIF
 */

class LoadingSystem {
  constructor(options = {}) {
    this.options = {
      minDisplayTime: 400, // Brief display so overlay doesn't block; we hide when DOM/first paint is ready, not full page load
      transitionDuration: 600, // Fade transition duration
      backgroundColor: '#ffffff', // White background
      loadingGif: '1_photos/loading.gif', // Single loading GIF
      ...options
    };
    
    this.startTime = null;
    this.isLoading = true;
    this.loadingScreen = null;
    
    this.init();
  }

  init() {
    this.createLoadingScreen();
    this.startTime = Date.now();
    
    // Hide when DOM is ready and first screen can render (don't wait for all images/videos)
    const tryHide = () => {
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, this.options.minDisplayTime - elapsed);
      setTimeout(() => this.hideLoadingScreen(), remaining);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryHide);
    } else {
      tryHide();
    }
  }

  createLoadingScreen() {
    // Create loading overlay
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.id = 'loading-overlay';
    this.loadingScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${this.options.backgroundColor};
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
      transition: opacity ${this.options.transitionDuration}ms ease-out;
    `;

    // Create loading GIF
    const loadingImage = document.createElement('img');
    loadingImage.id = 'loading-image';
    loadingImage.style.cssText = `
      max-width: 200px;
      max-height: 200px;
      width: auto;
      height: auto;
    `;
    loadingImage.src = this.options.loadingGif;
    loadingImage.alt = 'Loading...';

    this.loadingScreen.appendChild(loadingImage);

    // Add to page
    document.body.appendChild(this.loadingScreen);
  }


  hideLoadingScreen() {
    if (!this.loadingScreen) return;

    // Fade out loading screen
    this.loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
      if (this.loadingScreen && this.loadingScreen.parentNode) {
        this.loadingScreen.parentNode.removeChild(this.loadingScreen);
      }
      this.isLoading = false;
    }, this.options.transitionDuration);
  }

  // Method to manually hide loading screen (if needed)
  hide() {
    this.hideLoadingScreen();
  }

}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on index.html, about.html, or calendar.html
  const currentPath = window.location.pathname;
  const currentFile = currentPath.split('/').pop();
  
  if (currentFile === 'index.html' || currentFile === 'about.html' || currentFile === 'calendar.html' || currentFile === '') {
    window.loadingSystem = new LoadingSystem();
  }
});

// Export for manual use if needed
window.LoadingSystem = LoadingSystem;
