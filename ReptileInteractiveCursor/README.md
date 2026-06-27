# Reptile Interactive Cursor - Kinematic Glow Engine

[![Watch on YouTube](https://img.shields.io/badge/YouTube-Watch%20on%20YouTube-red?style=for-the-badge&logo=youtube)](https://youtube.com/shorts/HkUybZ7mQqQ?feature=share)

An interactive, high-performance HTML5 Canvas procedural animation displaying a bioluminescent, glowing creature (lizard/centipede) that trails the user's cursor with fluid, lifelike movements.

---

## 🌟 Key Features

* **Procedural Kinematics:** Realistic anatomical segment movement using mathematical constraints and inverse kinematics for limbs, joints, and fingers.
* **Glassmorphic Controls UI:** A sleek, semi-transparent settings panel offering real-time custom configuration of the creature's anatomy and visuals.
* **Responsive 60 FPS Physics Step:** Decoupled simulation updates utilizing a fixed timestep accumulator. This ensures consistent physics behavior and speed across all monitor refresh rates (60Hz, 120Hz, 144Hz, 240Hz, etc.).
* **Bioluminescent Neon Themes:** Six distinct preset styling themes:
  * **Reef:** Teal & Violet deep-sea glow.
  * **Cyberpunk (Neon):** Pink, Magenta, & Cyan neon glow.
  * **Magma:** Hot molten red, orange, & gold fire styling.
  * **Toxic:** Bright radioactive green & lime accents.
  * **Ghost:** Spectral soft lavender & pastel pink.
  * **Rainbow:** Color-shifting dynamic HSL spectrum.
* **Ambient Spore Particles:** A floating background field of particles that drift ambiently and react physically to the reptile's movement.
* **Tactile Shockwave Ripples:** Clicking the screen generates a glowing shockwave ring, pushing particles and body segments away on impact.
* **Retina / 4K Sharpness Support:** Auto-adjusts drawing buffer matching the browser's `window.devicePixelRatio` for perfectly crisp rendering on high-DPI screens.

---

## 🎮 Controls

* **Move Mouse:** Attract and guide the creature's head.
* **Left-Click (on canvas):** Trigger a glowing shockwave ripple.
* **Spacebar:** Pause / Resume the animation loop.
* **Settings Toggle (Top-Right Icon):** Hide or show the controls panel sidebar (perfect for full-screen showcase and recordings).

---

## 🛠️ Configuration Controls

| Param | Description |
| --- | --- |
| **Color Themes** | Switches color palettes, glow colors, and background gradients. |
| **Leg Count** | Re-generates the torso, scaling segment counts from 2 pairs up to 30. |
| **Tail Length** | Re-builds the vertebrae chain length of the tail. |
| **Creature Scale** | Scales overall body, bone lengths, head, and line-widths. |
| **Movement Speed** | Modifies maximum forward acceleration and friction. |
| **Glow Intensity** | Adjusts the shadow blur rendering factor. |
| **Ambient Spores** | Toggles the background spore particle generator. |
| **Leg Motion Ribs** | Toggles the rendering of lateral spine whiskers. |

---

## 📂 Project Structure

```
YouTube/
├── index.html   # Holds HTML, Outfit font import, CSS layout, and configuration controls
├── script.js    # Kinematics engine, particle logic, update loops, and canvas drawing
└── README.md    # Documentation (this file)
```

---

## 🚀 How to Run Locally

### Option 1: Direct File
1. Open the folder `YouTube`.
2. Double-click `index.html` to open it directly in any modern web browser.

### Option 2: Local Server (Recommended for performance)
Run a server from the workspace root directory:

**Using Python:**
```bash
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

**Using Node.js:**
```bash
npx http-server -p 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.
