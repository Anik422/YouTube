const toggle = document.getElementById('themeToggle');
const icon = document.getElementById('themeIcon');
const label = document.querySelector('.toggle-label');
const body = document.body;

// Track active transition state to prevent stutter and spam clicks
let swapTimeout = null;
let isAnimating = false;

toggle.addEventListener('change', () => {
    if (isAnimating) {
        // Prevent theme toggle during active animation to keep state in sync
        toggle.checked = body.classList.contains('light-theme');
        return;
    }
    const isLight = toggle.checked;
    isAnimating = true;
    // Apply background and track layout changes immediately
    body.classList.toggle('light-theme', isLight);

    // Fade out and shrink the icon & text
    icon.classList.add('swapping');
    label.classList.add('swapping');

    if (swapTimeout) {
        clearTimeout(swapTimeout);
    }
    // At the midpoint (250ms), swap icon src/text content, then expand back
    swapTimeout = setTimeout(() => {
        icon.src = isLight ? 'icons/sun.png' : 'icons/moon.png';
        label.textContent = isLight ? 'Dark' : 'Light';

        icon.classList.remove('swapping');
        label.classList.remove('swapping');
        
        isAnimating = false;
    }, 250);
});