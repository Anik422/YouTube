# Magic Apple Navigation UI 🌌

An ultra-premium, interactive, and high-performance floating liquid glass navigation bar designed with Apple-inspired physics-based animations, organic glows, and volumetric 3D parallax. Built entirely from scratch with semantic HTML5, modern CSS3 variables/layout engines, and optimized Vanilla JavaScript. No external UI frameworks or animation libraries are used.

## 🚀 Key Features

* **Liquid Glassmorphism:** Semi-transparent capsule layout leveraging subpixel backdrop filters (`backdrop-filter: blur(25px)`), frosted glass rims, and ambient depth drop shadows.
* **SVG Displacement Warp:** High-density vector displacement noise (`feTurbulence`) that distorts the glass refractions dynamically based on real-time mouse coordinate velocity.
* **Squash & Stretch Capsule indicator:** The active tab capsule indicator slides elastically and stretches along the vector of motion using linear interpolation (Lerp) calculations:
  * Origin targets swap automatically (`0% 50%` or `100% 50%`) based on drag direction.
  * Capsule skews and stretches horizontally during transitions, snapping back elastically on arrival.
* **Weightless Suspension Float:** Continuous vertical low-frequency sine oscillation combined with cursor-sensitive 3D perspective tilts (`perspective(1000px) rotateX/Y`).
* **Hover Shimmer Beam:** Pseudo-element linear sweeps on navigation elements that trigger a spotlight shimmer on mouse cursor hover.
* **Accessibility Integrated:** Keyboard focus states track links, supports reduced motion profiles via media queries (`prefers-reduced-motion: reduce`), and uses semantic tags and ARIA descriptors.
* **Calibration Console:** Interactive lab module at the bottom of the page to adjust parameters like magnetic radius, blur, active glow index, and elasticity delay coefficient in real-time.

---

## 📺 YouTube Video Tutorial Integration

This layout includes dedicated floating CTA links to drive viewers to your YouTube walkthrough or coding channel.

### How to link your YouTube Video:
1. Open the [index.html](index.html) file.
2. Search for the placeholder string `YOUR_YOUTUBE_LINK_HERE` (present in both the desktop header `.nav-actions` and the responsive `.mobile-menu` dropdown list).
3. Replace `YOUR_YOUTUBE_LINK_HERE` with your actual YouTube video link, e.g., `https://youtu.be/QXn81HKNZ1s`.

---

## 📁 File Structure

```text
Magic Apple Navigation/
├── index.html            # Semantic structure, embedded SVGs, sections, and calibration lab
├── style.css             # Root design variables, mesh background, themes, glass shaders, and overrides
├── script.js             # Physics calculations, LERP animation frame loops, observers, and customizer bindings
├── youtube_thumbnail.png # High-CTR, premium 1280x720 cinematic thumbnail
└── README.md             # Project documentation and setup guide
```

---

## ⚙️ Installation & Local Preview

To run this project locally, simply clone the workspace and serve it using a local HTTP server:

### Python 3:
```bash
python -m http.server 8080
```
Then visit: [http://localhost:8080](http://localhost:8080)

### Node.js (npx):
```bash
npx -y http-server -p 8080
```
Then visit: [http://localhost:8080](http://localhost:8080)

---

## 🔬 Calibration Variables Reference

The Javascript physics parameters are configured globally in [script.js](script.js) and can be adjusted inside the code or via the UI sliders:

| Constant | Default Value | Description |
| --- | --- | --- |
| `magnetStrength` | `25` | Maximum distance (pixels) links translate toward the cursor. |
| `lerpCoefficient` | `0.12` | Interpolation factor (0.01 - 0.4). Lower is more elastic. |
| `blurIntensity` | `25` | Backdrop-filter glass blur radius in pixels. |
| `glowScale` | `0.3` | Active tab glowing shadow opacity index. |
| `attractionRadius` | `100` | Pull boundary distance from static link center coordinates. |
| `navbarParallaxEnabled` | `true` | Enables/Disables 3D parallax tilt rotations. |
| `cursorGlowEnabled` | `true` | Enables/Disables custom radial spotlight trails. |
