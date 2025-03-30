// ============================== initial fade ============================== // 

document.addEventListener("DOMContentLoaded", function () {
    // Select elements to fade in
    const elementsToFade = document.querySelectorAll(".resume-section");

    // Set initial opacity to 0
    elementsToFade.forEach(element => {
        element.style.opacity = "0";
        element.style.transition = "opacity 1.5s ease-out";
    });

    // Fade in after a short delay
    setTimeout(() => {
        elementsToFade.forEach(element => {
            element.style.opacity = "1";
        });
    }, 500);
});


// ============================== NAV BAR ================================== // 
let lastScrollTop = 0;

window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navigation-about");
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop) {
        // Scrolling down - hide entire navbar
        navbar.classList.add("nav-hidden");
        navbar.classList.remove("nav-visible");
    } else {
        // Scrolling up - show entire navbar with background
        navbar.classList.remove("nav-hidden");
        navbar.classList.add("nav-visible");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; 
    
    // Check if portfolio is in view and animate if needed
    checkPortfolioVisibility();
});

//============================gallery============================//

class PhotoGallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.track = this.container.querySelector(".gallery-track");
        this.images = Array.from(this.track.querySelectorAll(".gallery-item"));
        this.scrollSpeed = 0.7; // Consistent scroll speed
        this.currentScroll = 0;
        this.animationId = null;
        this.lastTimestamp = 0;
        
        this.setupGallery();
        this.fadeInGallery();
        this.startAutoScroll();
        this.addEventListeners();
    }

    setupGallery() {
        // Create two complete sets of images for seamless looping
        const originalImagesCount = this.images.length;
        
        // Clone all images and append them
        for (let i = 0; i < originalImagesCount; i++) {
            const clone = this.images[i].cloneNode(true);
            this.track.appendChild(clone);
        }
        
        // Set initial opacity
        this.images.forEach(img => {
            img.style.opacity = '0';
        });
        
        // Pre-calculate dimensions after cloning
        setTimeout(() => {
            // Get the first image's full width including margins
            const firstImage = this.images[0];
            const style = window.getComputedStyle(firstImage);
            const marginRight = parseInt(style.marginRight) || 0;
            const marginLeft = parseInt(style.marginLeft) || 0;
            
            this.itemWidth = firstImage.offsetWidth + marginRight + marginLeft;
            this.trackWidth = this.itemWidth * originalImagesCount;
            
            // Preload images to prevent loading delays
            this.images.forEach(img => {
                if (img.complete) return;
                img.onload = () => {
                    // Recalculate dimensions if needed
                    this.itemWidth = firstImage.offsetWidth + marginRight + marginLeft;
                    this.trackWidth = this.itemWidth * originalImagesCount;
                };
            });
        }, 100);
    }

    fadeInGallery() {
        // Fade in the entire gallery container
        setTimeout(() => {
            this.container.style.opacity = '1';
            
            // Fade in all images
            this.images.forEach((img, index) => {
                setTimeout(() => {
                    img.style.opacity = '1';
                }, index * 100);
            });
        }, 100);
    }

    startAutoScroll() {
        // Use timestamp-based animation for smoother scrolling
        const animate = (timestamp) => {
            if (!this.lastTimestamp) this.lastTimestamp = timestamp;
            
            // Calculate time elapsed since last frame
            const elapsed = timestamp - this.lastTimestamp;
            
            // Update scroll position based on time elapsed for consistent speed
            this.currentScroll += (this.scrollSpeed * elapsed) / 16; // Normalize to ~60fps
            this.updateGalleryPosition();
            
            this.lastTimestamp = timestamp;
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    updateGalleryPosition() {
        // Implement a more seamless loop
        if (this.currentScroll >= this.trackWidth) {
            // Instead of resetting to 0, subtract the track width
            // This prevents any visual jump
            this.currentScroll = this.currentScroll - this.trackWidth;
        }
        
        // Apply transformation without transition for smoother animation
        this.track.style.transform = `translateX(-${this.currentScroll}px)`;
    }

    addEventListeners() {
        // Handle horizontal scrolling without affecting auto-scroll
        this.container.addEventListener('wheel', (event) => {
            // Only handle horizontal scrolling events
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                event.preventDefault();
                
                // Adjust scroll position but don't interrupt the animation
                this.currentScroll += event.deltaX;
                // No need to call updateGalleryPosition() as the animation loop will handle it
            }
        }, { passive: false });
    }

    // Cleanup method
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.container.removeEventListener('wheel', () => {});
    }
}

// Initialize the gallery when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new PhotoGallery("galleryContainer");
});


//=================================== TRANSITION ===================================//
// ================== LOGO CLICK ON ABOUT PAGE ================== // 
document.addEventListener("DOMContentLoaded", function () {
    const logoAbout = document.querySelector(".logo-about");
    const biggername = document.querySelector(".biggername");
    
    // Explicitly select elements to fade out
    const galleryContainer = document.querySelector(".gallery-container");
    const resumeSection = document.querySelector(".resume-section");
    const exploringSection = document.querySelector(".exploring-worlds-container");
    
    // Select all other elements that should fade out
    const elementsToFadeOut = document.querySelectorAll(
        "section:not(.hero), footer, .navigation > *:not(.logo-about), .about-content, .photo-grid"
    );
    
    if (logoAbout && biggername) {
        logoAbout.addEventListener("click", function(event) {
            event.preventDefault();
            

            window.scrollTo({ top: 0, behavior: "smooth" });
            

            setTimeout(() => {

                if (galleryContainer) {
                    galleryContainer.style.transition = "opacity 0.5s ease-in-out";
                    galleryContainer.style.opacity = "0";
                }
                

                if (resumeSection) {
                    resumeSection.style.transition = "opacity 0.5s ease-in-out";
                    resumeSection.style.opacity = "0";
                }
                

                if (exploringSection) {
                    exploringSection.style.transition = "opacity 0.5s ease-in-out";
                    exploringSection.style.opacity = "0";
                }
                

                elementsToFadeOut.forEach(element => {
                    element.style.transition = "opacity 0.5s ease-in-out";
                    element.style.opacity = "0";
                });
                

                biggername.style.transition = "font-size 0.5s ease-in-out, transform 0.5s ease-in-out";
                biggername.style.fontSize = "clamp(1px, 14vw, 560px)";
                biggername.style.transform = "translateY(52.5%)";
                
                
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 500);
            }, 300);
        });
    }
});




// // 
