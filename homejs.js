// ============================ CUSTOM URLS ================================//
const imageUrls = {
    design: [
        'https://www.lovemagia.com/',
        'https://glamorous-stitch-f64.notion.site/Sync-1c577703d9b7805dbdfac2002809f2b2',
        'https://www.instagram.com/p/DEL-GcHPhb_/',
        'https://www.boldsnax.com/',
        'https://glamorous-stitch-f64.notion.site/Multi-Purpose-Furniture-1c577703d9b7805f8cd2eb97b78315ea',
        'http://wupen.org/competitions/116?type=work&entry=7437',
        'https://www.scalingsolutionsltd.com/',
        'https://www.instagram.com/p/DAkCGxTvK7-/',
        'https://glamorous-stitch-f64.notion.site/Coming-Soon-1c577703d9b7808b9c9ce33638a83887' //coming soon
    ],
    art: [
        'https://glamorous-stitch-f64.notion.site/Control-1c577703d9b7803b890ffaa1f3ba832e',
        'https://glamorous-stitch-f64.notion.site/The-Tree-18477703d9b7803a989bdcddeb423d45',
        'https://glamorous-stitch-f64.notion.site/The-City-s-Reflection-1c577703d9b7803e92c7fb9c945f6754',
        'https://glamorous-stitch-f64.notion.site/The-Ritual-1c577703d9b7807cb895d3428af39c7b',
        'https://glamorous-stitch-f64.notion.site/Through-My-Eyes-1c577703d9b780ff9a60f22e3c76fca4?pvs=73',
        'https://glamorous-stitch-f64.notion.site/A-Midsummer-Day-s-Dream-1c577703d9b7806faa2cc6ae3e7c582a',
        'https://glamorous-stitch-f64.notion.site/Light-and-Dark-Studies-1c577703d9b7805fbeecd108e31d33be',
        'https://glamorous-stitch-f64.notion.site/The-City-s-Reflection-1c577703d9b7803e92c7fb9c945f6754',
        'https://glamorous-stitch-f64.notion.site/Albrecht-D-rer-Studies-1c577703d9b7803ca6fbc71be42c2a73?pvs=73'
    ],
    fashion: [
        'https://glamorous-stitch-f64.notion.site/Revink-1c677703d9b7809fb03dc036170adc6c',
        'https://glamorous-stitch-f64.notion.site/PROJECT-SPIRE-1c677703d9b7806f87bff73e2b9138ea',
        'https://www.instagram.com/p/C4B3TBvPhLx/?img_index=1',
        'https://www.instagram.com/p/C53sYh9RR58/?img_index=1',
        'https://www.instagram.com/p/C5we6dPyYNb/?img_index=1',
        'https://www.instagram.com/p/DB9w6E0zPMP/',
        'https://www.instagram.com/p/C6rpcW4yhNt/?img_index=2',
        'https://www.instagram.com/p/DCnfB2NP169/',
        'https://www.instagram.com/p/DB2uJPkxH4g/'
    ],
    music: [
        'https://open.spotify.com/track/0ExIWTffDUVQkBThvZ6L7T?si=e825129e9372426a',
        'https://open.spotify.com/track/4CxJKVpcCO4sPUPhjYFJ88?si=c225e4d6f3ef4ad2',
        'https://open.spotify.com/track/1DI9xDTHOcltHdy5K6m1vR?si=1a640403dbe0459b',
        'https://open.spotify.com/track/6xXL3jjqiODm3gBEVbMU9n?si=b92fc88bc2d648ba',
        'https://open.spotify.com/album/4VJWm9anX7wnh7JR0vQUfx?si=ejKT0KhFQJST3xbgNJsBqA',
        'https://open.spotify.com/track/6GiaZkiBrXNIfOCzCb2ION?si=787fd9405bce47f6',
        'https://open.spotify.com/track/6x6kpmcGN7XtAW7tpd1wTz?si=30f64f735fda4ae9',
        'https://open.spotify.com/track/1dgnotuTuf6f01DKvN4F6B?si=bc5101af1fa54f8a',
        'https://open.spotify.com/track/2TQ8gQc0RyCMBoWJcbzV0l?si=c97ecc3b57074f9d'
    ],
    video: [
        'https://www.instagram.com/p/C44Yms1LKuv/',
        'https://glamorous-stitch-f64.notion.site/Coming-Soon-1c577703d9b7808b9c9ce33638a83887',//coming soon
        'https://www.instagram.com/p/C40178JPF2i/',
        'https://www.instagram.com/p/C2y90z5OzV1/',
        'https://glamorous-stitch-f64.notion.site/Coming-Soon-1c577703d9b7808b9c9ce33638a83887',//coming soon
        'https://www.instagram.com/p/C2_lW1ILwkl/',
        'https://www.instagram.com/p/C4vWmECLE3g/',
        'https://www.youtube.com/watch?v=NH0KOuEOhqs&ab_channel=Tap',
        'https://glamorous-stitch-f64.notion.site/Coming-Soon-1c577703d9b7808b9c9ce33638a83887' //coming soon
    ]
};

const profileUrls = {
    design: 'https://glamorous-stitch-f64.notion.site/Multi-Purpose-Furniture-1c577703d9b7805f8cd2eb97b78315ea',
    art: 'https://glamorous-stitch-f64.notion.site/Ignorance-18477703d9b78099bd61ed8b5fbde2d3',
    fashion: 'https://glamorous-stitch-f64.notion.site/Revink-1c677703d9b7809fb03dc036170adc6c',
    music: 'https://glamorous-stitch-f64.notion.site/Music-Production-1c677703d9b780bcb25ac2226d1e6a95',
    video: 'https://www.youtube.com/watch?v=XEkxxnjgrrI&ab_channel=Tap'
};


// ============================== initial fade ============================== // 

document.addEventListener("DOMContentLoaded", function () {
    // Select elements to fade in
    const elementsToFade = document.querySelectorAll(".location, .about-cta, .title-wrapper, .skills-section, .portfolio-grid, .footer");

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
    const navbar = document.querySelector(".navigation");
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


// ============================== BUTTONS ================================== // 
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get all skill buttons
    const designBtn = document.querySelector('.designbtn');
    const artBtn = document.querySelector('.artbtn');
    const fashionBtn = document.querySelector('.fashionbtn');
    const musicBtn = document.querySelector('.musicbtn');
    const videoBtn = document.querySelector('.videobtn');
    
    // Create an array of all buttons for easier manipulation
    const allButtons = [designBtn, artBtn, fashionBtn, musicBtn, videoBtn];
    
    // First, set a fixed width for each button to prevent layout shifts
    allButtons.forEach(btn => {
        // Get the width when bold (this prevents layout shift later)
        btn.style.fontWeight = '400';
        const boldWidth = btn.offsetWidth;
        
        // Reset to normal weight
        btn.style.fontWeight = '100';
        
        // Set a fixed width based on the bold state
        btn.style.width = boldWidth + 'px';
        btn.style.display = 'inline-block';
        btn.style.textAlign = 'left';
    });
    
    // Profile image element
    const profileImage = document.querySelector('.profile-image img');
    // Add transition to profile image
    profileImage.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    
    // Title elements
    const titleElement = document.querySelector('.title');
    const titlePrefix = document.querySelector('.title-prefix');
    // Add transitions to title elements
    titleElement.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    titlePrefix.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    
    // Portfolio item images
    const portfolioItems = document.querySelectorAll('.portfolio-item img');
    const portfolioSection = document.querySelector('.portfolio-grid');
    
    // Add CSS for animation to each portfolio item
    portfolioItems.forEach((item, index) => {
        item.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        item.style.transitionDelay = `${index * 0.05}s`; // Staggered delay for cascading effect
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
    });
    
    // Track if portfolio has been animated
    let portfolioAnimated = false;
    
    // Flag to track if initialization is complete
    let initializationComplete = false;
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Function to check portfolio visibility and animate if in view
    window.checkPortfolioVisibility = function() {
        if (!portfolioAnimated && isInViewport(portfolioSection)) {
            animatePortfolioItems();
            portfolioAnimated = true;
        }
    };
    
    // Function to animate portfolio items with row staggering
    function animatePortfolioItems() {
        const itemsPerRow = 4; // Assuming 4 items per row

        portfolioItems.forEach((item, index) => {
            // Calculate row based on index (0-based)
            const row = Math.floor(index / itemsPerRow);
            // Calculate position in row (0-based)
            const posInRow = index % itemsPerRow;
            
            // Delay increases by row first, then by position in row
            // INCREASED STAGGER: Row delay from 100ms to 150ms, position delay from 50ms to 80ms
            const delay = (row * 150) + (posInRow * 80);
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, delay);
        });
    }
    
    // Custom titles for each category
    const customTitles = {
        design: 'DESIGNER',
        art: 'ARTIST',
        fashion: 'CREATIVE',
        music: 'MUSICIAN',
        video: 'EDITOR'
    };
    
    // Image paths for different categories
    const imagePaths = {
        design: {
            profile: 'images/b1.png',
            portfolio: [
                'images/s1.png', 'images/s2.png', 'images/s3.png', 'images/s4.png',
                'images/s5.png', 'images/s6.png', 'images/s7.png', 'images/s8.png', 'images/s0.png'
            ]
        },
        art: {
            profile: 'images/b2.png',
            portfolio: [
                'images/a1.png', 'images/a2.png', 'images/a3.png', 'images/a4.png',
                'images/a5.png', 'images/a6.png', 'images/a7.png', 'images/a8.png', 'images/a9.png'
            ]
        },
        fashion: {
            profile: 'images/b3.png',
            portfolio: [
                'images/f1.png', 'images/f2.png', 'images/f3.png', 'images/f4.png',
                'images/f5.png', 'images/f6.png', 'images/f7.png', 'images/f8.png', 'images/f9.png'
            ]
        },
        music: {
            profile: 'images/b4.png',
            portfolio: [
                'images/m1.png', 'images/m2.png', 'images/m3.png', 'images/m4.png',
                'images/m5.png', 'images/m6.png', 'images/m7.png', 'images/m8.png', 'images/m9.png'
            ]
        },
        video: {
            profile: 'images/b5.png',
            portfolio: [
                'images/v1.gif', 'images/v2.gif', 'images/v3.gif', 'images/v4.gif',
                'images/v5.gif', 'images/v6.gif', 'images/v7.gif', 'images/v8.gif', 'images/v9.gif'
            ]
        }
    };
    
    // Track active button
    let activeButton = designBtn;
    
    // Function to reset all buttons to default style
    function resetButtonStyles() {
        allButtons.forEach(btn => {
            btn.style.fontWeight = '100';
            btn.style.color = '#9e9e9e';
            btn.classList.remove('active');
        });
    }
    
    
// Modify the updateImages function to update href attributes
function updateImages(category) {
    // Ignore clicks until initialization is complete
    if (!initializationComplete) {
        return;
    }
    
    // Animate out title elements
    titleElement.style.opacity = '0';
    titleElement.style.transform = 'translateY(20px)';
    titlePrefix.style.opacity = '0';
    titlePrefix.style.transform = 'translateY(20px)';
    
    // Animate out profile image
    profileImage.style.opacity = '0';
    profileImage.style.transform = 'translateY(30px)';
    
    // Animate out portfolio items
    portfolioItems.forEach((item) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
    });
    
    // Wait for fade out to complete
    setTimeout(() => {
        // Update profile image and its URL
        profileImage.src = imagePaths[category].profile;
        
        // Get the profile image link and update its href
        const profileLink = document.querySelector('.profile-image a');
        if (profileLink && profileUrls[category]) {
            profileLink.href = profileUrls[category];
        }
        
        // Update portfolio images and URLs
        const portfolioLinks = document.querySelectorAll('.portfolio-item a');
        portfolioItems.forEach((item, index) => {
            if (index < imagePaths[category].portfolio.length) {
                item.src = imagePaths[category].portfolio[index];
                
                // Update the href attribute of the parent <a> element
                if (index < imageUrls[category].length && portfolioLinks[index]) {
                    portfolioLinks[index].href = imageUrls[category][index];
                }
            }
        });
        
        // Determine proper article based on the title
        let article = "a";
        const title = customTitles[category];
        
        // Check if the title starts with a vowel sound
        if (title === "ARTIST" || title === "EDITOR") {
            article = "an";
        }
        
        // Set text with proper grammar
        titleElement.textContent = title;
        titlePrefix.textContent = `is ${article} `;
        
        // Wait longer to ensure images are loaded and title changes are complete
        setTimeout(() => {
            // Animate in profile image first
            profileImage.style.opacity = '1';
            profileImage.style.transform = 'translateY(0)';
            
            // Then animate in title elements with a significant delay
            // INCREASED STAGGER: Delay from 300ms to 400ms between profile and prefix
            setTimeout(() => {
                // First animate in the prefix with a longer delay
                titlePrefix.style.opacity = '1';
                titlePrefix.style.transform = 'translateY(0)';
                
                // Then animate in the main title with another delay
                // INCREASED STAGGER: Delay from 150ms to 250ms between prefix and title
                setTimeout(() => {
                    titleElement.style.opacity = '1';
                    titleElement.style.transform = 'translateY(0)';
                }, 250);
            }, 400);
            
            // Animate in portfolio items with row staggering
            // INCREASED STAGGER: Delay from 600ms to 800ms before portfolio starts animating
            setTimeout(() => {
                const itemsPerRow = 4; // Assuming 4 items per row

                portfolioItems.forEach((item, index) => {
                    // Calculate row based on index (0-based)
                    const row = Math.floor(index / itemsPerRow);
                    // Calculate position in row (0-based)
                    const posInRow = index % itemsPerRow;
                    
                    // INCREASED STAGGER: Row delay from 100ms to 150ms, position delay from 50ms to 80ms
                    const delay = (row * 150) + (posInRow * 80);
                    
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, delay);
                });
            }, 800);
            
        }, 250);
        
    }, 400);
}

// Add initialization for URLs including profile image URL
document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile URL for the default category (design)
    const profileLink = document.querySelector('.profile-image a');
    if (profileLink && profileUrls.design) {
        profileLink.href = profileUrls.design;
    }
    
    // Initialize URLs for the default category (design)
    const portfolioLinks = document.querySelectorAll('.portfolio-item a');
    portfolioLinks.forEach((link, index) => {
        if (index < imageUrls.design.length) {
            link.href = imageUrls.design[index];
        }
    });
});

    // ------------------------------------------------- //
    // -------- Set up button event handlers ----------- //
    // ------------------------------------------------- //

    function setupButton(button, category) {
        button.addEventListener('mouseenter', function() {
            if (this !== activeButton) {
                this.style.fontWeight = '400';
                this.style.color = 'black';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (this !== activeButton) {
                this.style.fontWeight = '100';
                this.style.color = '#9e9e9e';
            }
        });
        
        button.addEventListener('click', function() {
            if (this === activeButton) return; // No need to update if same button
            
            resetButtonStyles();
            this.style.fontWeight = '400';
            this.style.color = 'black';
            this.classList.add('active');
            activeButton = this;
            updateImages(category);
        });
    }
    
    // Set up all buttons
    setupButton(designBtn, 'design');
    setupButton(artBtn, 'art');
    setupButton(fashionBtn, 'fashion');
    setupButton(musicBtn, 'music');
    setupButton(videoBtn, 'video');
    
    // Initialize by setting Design as active
    resetButtonStyles();
    designBtn.style.fontWeight = '400';
    designBtn.style.color = 'black';
    designBtn.classList.add('active');
    activeButton = designBtn;
    
    // Initialize images
    profileImage.src = imagePaths['design'].profile;
    portfolioItems.forEach((item, index) => {
        if (index < imagePaths.design.portfolio.length) {
            item.src = imagePaths.design.portfolio[index];
        }
    });
    
    // Set initial title text
    titleElement.textContent = customTitles['design'];
    titlePrefix.textContent = 'is a ';
    
    // Set initial states for animations
    profileImage.style.opacity = '0';
    profileImage.style.transform = 'translateY(30px)';
    titleElement.style.opacity = '0';
    titleElement.style.transform = 'translateY(20px)';
    titlePrefix.style.opacity = '0';
    titlePrefix.style.transform = 'translateY(20px)';
    
    // Make title and profile image initially visible
    setTimeout(() => {
        profileImage.style.opacity = '1';
        profileImage.style.transform = 'translateY(0)';
        
        // INCREASED STAGGER: Delay from 300ms to 400ms between profile and prefix
        setTimeout(() => {
            titlePrefix.style.opacity = '1';
            titlePrefix.style.transform = 'translateY(0)';
            
            // INCREASED STAGGER: Delay from 150ms to 250ms between prefix and title
            setTimeout(() => {
                titleElement.style.opacity = '1';
                titleElement.style.transform = 'translateY(0)';
                
                // Mark initialization as complete so button clicks work
                setTimeout(() => {
                    initializationComplete = true;
                }, 300);
                
            }, 250);
        }, 400);
    }, 500);
    
    // Check if portfolio is already in view on page load
    setTimeout(() => {
        checkPortfolioVisibility();
    }, 800);
});


// ================== TRANSITION TO ABOUT ================== // 
document.addEventListener("DOMContentLoaded", function () {
    const aboutLink = document.querySelector(".about-link");
    const aboutCta = document.querySelector(".about-cta");
    const bigname = document.querySelector(".bigname");
    const location = document.querySelector(".location");
    const titleWrapper = document.querySelector(".title-wrapper");

    // Select all elements below the hero section
    const elementsBelowHero = document.querySelectorAll("section:not(.hero), footer");

    function transitionToAbout(event) {
        event.preventDefault(); // Prevent immediate navigation

        // Smoothly scroll to the top
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Wait for scroll to finish before fading out (adjust timing if needed)
        setTimeout(() => {
            // Fade out specific elements in the hero section
            [location, titleWrapper, aboutCta].forEach(element => {
                if (element) {
                    element.style.transition = "opacity 0.5s ease-in-out";
                    element.style.opacity = "0";
                }
            });

            // Fade out everything below the hero section
            elementsBelowHero.forEach(element => {
                element.style.transition = "opacity 0.5s ease-in-out";
                element.style.opacity = "0";
            });

            // Apply transformation to .bigname
            bigname.style.transition = "font-size 0.5s ease-in-out, transform 0.5s ease-in-out";
            bigname.style.fontSize = "clamp(1px, 20.5vw, 560px)";
            bigname.style.transform = "translateY(-35.8%)";
            bigname.style.position = "relative";

            // Redirect after animations complete
            setTimeout(() => {
                window.location.href = "about.html";
            }, 500); // Adjust to match fade-out duration
        }, 500); // Adjust to match smooth scroll timing
    }

    aboutLink.addEventListener("click", transitionToAbout);
    aboutCta.addEventListener("click", transitionToAbout);
});




//       //

