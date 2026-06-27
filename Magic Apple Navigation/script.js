/* ==========================================================================
   MAGIC APPLE NAVIGATION - PHYSICS & INTERACTIONS SCRIPT
   ========================================================================== */

// --- Global App Settings & State ---
const CONFIG = {
    magnetStrength: 25,       // Maximum offset in pixels
    lerpCoefficient: 0.12,    // Smoothness (0.01 - 0.4). Lower is more elastic/sluggish
    blurIntensity: 25,        // Backdrop glass blur in px
    glowScale: 0.3,           // Nav capsule shadow back-glow opacity
    cursorGlowEnabled: true,
    navbarParallaxEnabled: true,
    attractionRadius: 100     // Radius around link center to start pulling (px)
};

const STATE = {
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    isHoveringNav: false,
    hoveredLink: null,
    activeLink: null,

    // Smooth tracking variables (Lerped values)
    indicator: {
        currentX: 0,
        currentY: 0,
        currentWidth: 0,
        currentHeight: 0,
        targetX: 0,
        targetY: 0,
        targetWidth: 0,
        targetHeight: 0,
        opacity: 0,
        currentOpacity: 0
    },

    // Whole navbar tilt parallax
    tilt: {
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0
    }
};

// --- DOM References ---
const navHeader = document.getElementById('navHeader');
const navContainer = document.querySelector('.nav-container');
const navBar = document.getElementById('mainNav');
const navIndicator = document.getElementById('navIndicator');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const customCursor = document.getElementById('customCursor');
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

// Customizer Controls
const ctrlMagnet = document.getElementById('magnetStrength');
const ctrlLerp = document.getElementById('lerpConstant');
const ctrlBlur = document.getElementById('blurIntensity');
const ctrlGlow = document.getElementById('glowScale');
const ctrlCursor = document.getElementById('toggleCursorGlow');
const ctrlParallax = document.getElementById('toggleNavbarParallax');
const btnReset = document.getElementById('resetCustomizer');

// Set up stable magnetic data structure relative to static parent list items
const magneticLinks = [];
navLinks.forEach(link => {
    magneticLinks.push({
        element: link,
        parent: link.parentElement,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0
    });
});

// --- Initialize App ---
function init() {
    // Determine initially active link
    const initialActive = document.querySelector('.nav-link.active') || navLinks[0];
    setActiveLink(initialActive);

    // Snap indicator immediately to initial item to avoid sliding in from (0,0) on page load
    snapIndicatorToActive();

    // Attach Event Listeners
    setupEventListeners();

    // Start RAF Loop
    requestAnimationFrame(animationLoop);
}

// --- Event Listeners ---
function setupEventListeners() {
    // Scroll shrink effect
    window.addEventListener('scroll', handleScroll, { passive: true });

    // General mouse track inside window (for cursor glow)
    window.addEventListener('mousemove', e => {
        STATE.mouseX = e.clientX;
        STATE.mouseY = e.clientY;

        if (CONFIG.cursorGlowEnabled) {
            customCursor.classList.add('active');
        } else {
            customCursor.classList.remove('active');
        }
    });

    window.addEventListener('mouseleave', () => {
        customCursor.classList.remove('active');
    });

    // Tracking mouse movements inside navigation bar capsule
    navContainer.addEventListener('mouseenter', () => {
        STATE.isHoveringNav = true;
    });

    navContainer.addEventListener('mousemove', handleNavbarMouseMove);

    navContainer.addEventListener('mouseleave', () => {
        STATE.isHoveringNav = false;
        STATE.hoveredLink = null;

        // Reset dynamic tilt
        STATE.tilt.targetX = 0;
        STATE.tilt.targetY = 0;

        // Reset all magnetic pulls
        magneticLinks.forEach(item => {
            item.targetX = 0;
            item.targetY = 0;
        });
    });

    // Individual item listeners
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            STATE.hoveredLink = link;
            STATE.indicator.opacity = 1;
        });

        link.addEventListener('click', (e) => {
            // Smooth scroll overrides if needed, click visual ripple trigger
            createRipple(e, link);
            setActiveLink(link);
        });

        // Accessible keyboard focus tracking
        link.addEventListener('focus', () => {
            STATE.hoveredLink = link;
            STATE.indicator.opacity = 1;
        });
        link.addEventListener('blur', () => {
            if (document.activeElement.classList && !document.activeElement.classList.contains('nav-link')) {
                STATE.hoveredLink = null;
            }
        });
    });

    // Mobile Hamburger Menu Toggle
    mobileToggle.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
            const targetId = link.getAttribute('data-target') || link.getAttribute('href').substring(1);
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.scrollIntoView({ behavior: 'smooth' });
                // Find matching main desktop link to set active
                const mainLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
                if (mainLink) setActiveLink(mainLink);
            }
        });
    });

    // Setup Customizer Sliders
    setupCustomizerControls();

    // Intersection Observer for scroll synchronization
    setupScrollObserver();
}

// --- Navigation Physics calculations inside loop ---
function handleNavbarMouseMove(e) {
    const rect = navContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update light reflection custom variables
    navContainer.style.setProperty('--mouse-x', `${x}px`);
    navContainer.style.setProperty('--mouse-y', `${y}px`);

    // 3D Parallax Tilt calculations
    if (CONFIG.navbarParallaxEnabled) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // Normalize delta values from -1 to 1
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        STATE.tilt.targetY = deltaX * 4;  // Tilt on Y axis (left-right movement)
        STATE.tilt.targetX = -deltaY * 4; // Tilt on X axis (up-down movement)
    } else {
        STATE.tilt.targetX = 0;
        STATE.tilt.targetY = 0;
    }

    // Magnetic pull calculations for all nav link children
    magneticLinks.forEach(item => {
        const parentRect = item.parent.getBoundingClientRect();
        const centerX = parentRect.left + parentRect.width / 2;
        const centerY = parentRect.top + parentRect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance < CONFIG.attractionRadius) {
            // Apply organic spring pull math
            const force = (CONFIG.attractionRadius - distance) / CONFIG.attractionRadius;
            item.targetX = dx * force * (CONFIG.magnetStrength / 100);
            item.targetY = dy * force * (CONFIG.magnetStrength / 100);
        } else {
            item.targetX = 0;
            item.targetY = 0;
        }
    });
}

// --- Set Active Nav States ---
function setActiveLink(linkElement) {
    if (!linkElement) return;

    navLinks.forEach(l => l.classList.remove('active'));
    linkElement.classList.add('active');
    STATE.activeLink = linkElement;

    // Synchronize Mobile Menu link active states
    const targetId = linkElement.getAttribute('href').substring(1);
    mobileLinks.forEach(ml => {
        if (ml.getAttribute('data-target') === targetId || ml.getAttribute('href') === `#${targetId}`) {
            ml.classList.add('active');
        } else {
            ml.classList.remove('active');
        }
    });
}

// --- Slide Capsule Calculations ---
function updateIndicatorTargets() {
    // If hovering, target is the hovered link. Otherwise target is the active link.
    const targetElement = STATE.hoveredLink || STATE.activeLink;

    if (targetElement) {
        const navRect = navBar.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        STATE.indicator.targetX = targetRect.left - navRect.left;
        STATE.indicator.targetY = targetRect.top - navRect.top;
        STATE.indicator.targetWidth = targetRect.width;
        STATE.indicator.targetHeight = targetRect.height;
        STATE.indicator.opacity = 1;
    } else {
        STATE.indicator.opacity = 0;
    }
}

// Snap directly without animation on load
function snapIndicatorToActive() {
    updateIndicatorTargets();
    STATE.indicator.currentX = STATE.indicator.targetX;
    STATE.indicator.currentY = STATE.indicator.targetY;
    STATE.indicator.currentWidth = STATE.indicator.targetWidth;
    STATE.indicator.currentHeight = STATE.indicator.targetHeight;
    STATE.indicator.currentOpacity = STATE.indicator.opacity;

    navIndicator.style.transform = `translate3d(${STATE.indicator.currentX}px, ${STATE.indicator.currentY}px, 0)`;
    navIndicator.style.width = `${STATE.indicator.currentWidth}px`;
    navIndicator.style.height = `${STATE.indicator.currentHeight}px`;
    navIndicator.style.opacity = STATE.indicator.currentOpacity;
}

// --- Visual Click Ripples ---
function createRipple(event, parentElement) {
    // Create ripple circle
    const ripple = document.createElement('span');
    ripple.classList.add('click-ripple');

    // Append temporarily
    parentElement.appendChild(ripple);

    const rect = parentElement.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    // Position at click coordinates relative to link boundaries
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Clean up
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

// Add CSS rules dynamically for dynamic ripple elements (avoiding cluttering style.css rules)
const style = document.createElement('style');
style.innerHTML = `
    .click-ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        transform: scale(0);
        animation: rip 0.5s ease-out;
        pointer-events: none;
        z-index: 1;
    }
    .theme-light .click-ripple {
        background: rgba(0, 113, 227, 0.2);
    }
    @keyframes rip {
        to {
            transform: scale(2.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// --- Scroll Handling ---
function handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
        navHeader.classList.add('scrolled');
    } else {
        navHeader.classList.remove('scrolled');
    }
}

// --- Intersection Observer (Section Tracker) ---
function setupScrollObserver() {
    const observerOptions = {
        root: null,
        // Highlights section when occupying vertical middle area
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const matchingLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (matchingLink) {
                    setActiveLink(matchingLink);
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

// --- Mobile Drawer Controls ---
function toggleMobileMenu() {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('active');

    // Prevent background scroll when menu is active
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
}

function closeMobileMenu() {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

// --- Setup Calibration Console ---
function setupCustomizerControls() {
    // Initial UI syncing
    document.getElementById('magnetVal').textContent = CONFIG.magnetStrength;
    document.getElementById('lerpVal').textContent = CONFIG.lerpCoefficient.toFixed(2);
    document.getElementById('blurVal').textContent = CONFIG.blurIntensity;
    document.getElementById('glowVal').textContent = CONFIG.glowScale.toFixed(1);

    // Listeners
    ctrlMagnet.addEventListener('input', (e) => {
        CONFIG.magnetStrength = parseInt(e.target.value);
        document.getElementById('magnetVal').textContent = CONFIG.magnetStrength;
    });

    ctrlLerp.addEventListener('input', (e) => {
        CONFIG.lerpCoefficient = parseFloat(e.target.value);
        document.getElementById('lerpVal').textContent = CONFIG.lerpCoefficient.toFixed(2);
    });

    ctrlBlur.addEventListener('input', (e) => {
        CONFIG.blurIntensity = parseInt(e.target.value);
        document.getElementById('blurVal').textContent = CONFIG.blurIntensity;
        document.documentElement.style.setProperty('--nav-blur', `${CONFIG.blurIntensity}px`);
    });

    ctrlGlow.addEventListener('input', (e) => {
        CONFIG.glowScale = parseFloat(e.target.value);
        document.getElementById('glowVal').textContent = CONFIG.glowScale.toFixed(1);
        document.documentElement.style.setProperty('--nav-glow-opacity', CONFIG.glowScale);
    });

    ctrlCursor.addEventListener('change', (e) => {
        CONFIG.cursorGlowEnabled = e.target.checked;
        if (!CONFIG.cursorGlowEnabled) {
            customCursor.classList.remove('active');
        }
    });

    ctrlParallax.addEventListener('change', (e) => {
        CONFIG.navbarParallaxEnabled = e.target.checked;
    });

    btnReset.addEventListener('click', () => {
        CONFIG.magnetStrength = 25;
        CONFIG.lerpCoefficient = 0.12;
        CONFIG.blurIntensity = 25;
        CONFIG.glowScale = 0.3;
        CONFIG.cursorGlowEnabled = true;
        CONFIG.navbarParallaxEnabled = true;

        // Sync Inputs
        ctrlMagnet.value = 25;
        ctrlLerp.value = 0.12;
        ctrlBlur.value = 25;
        ctrlGlow.value = 0.3;
        ctrlCursor.checked = true;
        ctrlParallax.checked = true;

        // Sync UI labels
        document.getElementById('magnetVal').textContent = 25;
        document.getElementById('lerpVal').textContent = "0.12";
        document.getElementById('blurVal').textContent = 25;
        document.getElementById('glowVal').textContent = "0.3";

        // Reset styling variables
        document.documentElement.style.setProperty('--nav-blur', '25px');
        document.documentElement.style.setProperty('--nav-glow-opacity', 0.3);

        setAppTheme('theme-dark');

        // Clear active indicators on theme buttons
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.preset-btn[onclick="setAppTheme(\'theme-dark\')"]').classList.add('active');
    });
}

// --- Live Theme Switcher ---
window.setAppTheme = function (themeClass) {
    // Remove existing theme classes
    document.body.classList.remove('theme-dark', 'theme-neon', 'theme-teal', 'theme-light');
    document.body.classList.add(themeClass);

    // Keep configuration presets synced
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(themeClass)) {
            btn.classList.add('active');
        }
    });

    // Update active visual portfolio tags
    document.querySelectorAll('.portfolio-item').forEach(item => {
        const tag = item.querySelector('.preview-tag');
        if (item.getAttribute('onclick').includes(themeClass)) {
            tag.textContent = "Active Preset";
        } else {
            tag.textContent = "Click to Apply";
        }
    });
};

// --- Main GPU-Accelerated Animation Loop (requestAnimationFrame) ---
function animationLoop() {
    // 1. Smoothly Lerp Custom Cursor position
    STATE.cursorX += (STATE.mouseX - STATE.cursorX) * 0.15;
    STATE.cursorY += (STATE.mouseY - STATE.cursorY) * 0.15;

    if (CONFIG.cursorGlowEnabled) {
        customCursor.style.transform = `translate3d(${STATE.cursorX}px, ${STATE.cursorY}px, 0)`;
    }

    // 2. Smoothly Lerp Parallax Navbar Tilts
    STATE.tilt.currentX += (STATE.tilt.targetX - STATE.tilt.currentX) * 0.1;
    STATE.tilt.currentY += (STATE.tilt.targetY - STATE.tilt.currentY) * 0.1;

    // 3. Smoothly Lerp individual nav links for Magnetic Translation
    magneticLinks.forEach(item => {
        item.currentX += (item.targetX - item.currentX) * CONFIG.lerpCoefficient;
        item.currentY += (item.targetY - item.currentY) * CONFIG.lerpCoefficient;

        item.element.style.transform = `translate3d(${item.currentX}px, ${item.currentY}px, 0)`;
    });

    // 4. Update and Lerp active glowing capsule indicators
    updateIndicatorTargets();

    STATE.indicator.currentX += (STATE.indicator.targetX - STATE.indicator.currentX) * CONFIG.lerpCoefficient;
    STATE.indicator.currentY += (STATE.indicator.targetY - STATE.indicator.currentY) * CONFIG.lerpCoefficient;
    STATE.indicator.currentWidth += (STATE.indicator.targetWidth - STATE.indicator.currentWidth) * CONFIG.lerpCoefficient;
    STATE.indicator.currentHeight += (STATE.indicator.targetHeight - STATE.indicator.currentHeight) * CONFIG.lerpCoefficient;
    STATE.indicator.currentOpacity += (STATE.indicator.opacity - STATE.indicator.currentOpacity) * 0.15;

    // Render Indicator Transforms
    navIndicator.style.transform = `translate3d(${STATE.indicator.currentX}px, ${STATE.indicator.currentY}px, 0)`;
    navIndicator.style.width = `${STATE.indicator.currentWidth}px`;
    navIndicator.style.height = `${STATE.indicator.currentHeight}px`;
    navIndicator.style.opacity = STATE.indicator.currentOpacity;

    // Render Whole Container transforms (incorporating shrink state + 3D tilt)
    const activeTiltX = STATE.tilt.currentX;
    const activeTiltY = STATE.tilt.currentY;
    navContainer.style.transform = `perspective(1000px) rotateX(${activeTiltX}deg) rotateY(${activeTiltY}deg)`;

    // Repeat loop
    requestAnimationFrame(animationLoop);
}

// Fire on document ready
window.addEventListener('DOMContentLoaded', init);
