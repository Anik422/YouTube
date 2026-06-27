# 📊 Linear Search Visualizer — Interactive Dashboard Console

An award-winning, premium, and visually stunning **Linear Search Visualizer Dashboard** built using only raw HTML, CSS, and Vanilla JavaScript. Designed in a strict fullscreen layout inspired by modern SaaS interfaces like Linear, Apple, Stripe, and Figma.

🎥 **[Watch the YouTube Video Tutorial here](https://www.youtube.com/)**

---

## ✨ Features

*   **🖥️ Strict Fullscreen Console**: Formulated to fit entirely inside one viewport (`100vw × 100vh`). Absolutely no body scrolling. Cards, statistics, and text scale organically on screen resizing.
*   **🌌 Dynamic Mesh Auroras**: A multi-layered background featuring moving blur blob gradients, canvas floating particle grids, and a digital noise overlay.
*   **🎹 Synthesized Audio (Web Audio API)**: Sound synthesis on the fly. Generates clicks on navigation ticks, warning buzzes on mismatches, reset whooshes, and custom arpeggiated success chords. No network audio files required.
*   **🎛️ Configuration Console**: Add custom integer arrays or click **Randomize** to generate values. Easily customize targets and control visualizer speeds.
*   **🧩 Interactive State Loops**:
    *   *Auto Mode*: Runs comparisons at adjustable speeds.
    *   *Step-by-Step*: Walk through operations manually index by index.
*   **📟 Typing Logs & Highlighted Code**: Active code lines glow as the visualizer executes. Steps are printed in real-time inside a terminal console with realistic typing animations.
*   **📊 Live Metrics Board**: View active pointers, indices, comparisons, progress bars, time complexity ($O(N)$), and space complexity ($O(1)$) update live.
*   **🎥 Screen Recorder**: Built-in tab capturer using browser `MediaRecorder` lets you export visualizer runs as high-quality WebM videos for tutorials.

---

## 🎹 Keyboard Shortcuts

Focus away from input fields and press:

| Key | Action |
|---|---|
| `Space` | Play / Pause visualization |
| `S` or `ArrowRight` | Execute next step (Step-by-Step mode) |
| `R` | Reset visualizer workspace |
| `N` | Generate a new random array |
| `F` | Toggle browser Fullscreen mode |

---

## 🚀 Running Locally

1. Clone or download the folder files:
   * `index.html`
   * `style.css`
   * `script.js`
2. Open `index.html` directly in any web browser.
3. Or launch a local development server in the directory:
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   ```
4. Access the console at `http://localhost:8080`.
