// State Configuration
const CONFIG = {
  theme: 'reef',
  legCount: 10,
  tailLength: 60,
  scale: 0.8,
  speed: 1.5,
  glow: 15,
  showParticles: true,
  drawRibs: true,
  isPaused: false
};

// Theme presets
const THEMES = {
  reef: {
    name: 'Reef',
    glow: 'rgba(6, 182, 212, 0.6)',
    headColor: { h: 185, s: 100, l: 50 },
    tailColor: { h: 220, s: 100, l: 65 },
    legColor: { h: 195, s: 100, l: 50 },
    bgGrad: ['#040a1b', '#010307'],
    particleColors: ['#00f2fe', '#4facfe', '#00c6ff', '#88eeff'],
    accent: '#06b6d4'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    glow: 'rgba(255, 0, 127, 0.65)',
    headColor: { h: 330, s: 100, l: 50 },
    tailColor: { h: 40, s: 100, l: 50 },
    legColor: { h: 320, s: 100, l: 50 },
    bgGrad: ['#12031a', '#030007'],
    particleColors: ['#ff007f', '#ffaa00', '#ff00ab', '#00ffcc'],
    accent: '#ff007f'
  },
  magma: {
    name: 'Magma',
    glow: 'rgba(239, 68, 68, 0.65)',
    headColor: { h: 9, s: 100, l: 58 },
    tailColor: { h: 348, s: 100, l: 59 },
    legColor: { h: 30, s: 100, l: 50 },
    bgGrad: ['#190606', '#050101'],
    particleColors: ['#ff4b2b', '#ff416c', '#ff8c00', '#ffea00'],
    accent: '#ef4444'
  },
  acid: {
    name: 'Toxic',
    glow: 'rgba(16, 185, 129, 0.65)',
    headColor: { h: 84, s: 100, l: 59 },
    tailColor: { h: 120, s: 100, l: 50 },
    legColor: { h: 150, s: 100, l: 50 },
    bgGrad: ['#031008', '#000401'],
    particleColors: ['#adff2f', '#00ff00', '#00ff87', '#55ff55'],
    accent: '#10b981'
  },
  ghost: {
    name: 'Ghost',
    glow: 'rgba(168, 85, 247, 0.6)',
    headColor: { h: 258, s: 45, l: 68 },
    tailColor: { h: 325, s: 58, l: 84 },
    legColor: { h: 260, s: 70, l: 80 },
    bgGrad: ['#0b0716', '#020105'],
    particleColors: ['#a18cd1', '#fbc2eb', '#e2d1f9', '#b592ff'],
    accent: '#a855f7'
  },
  rainbow: {
    name: 'Rainbow',
    glow: 'rgba(255, 255, 255, 0.45)',
    bgGrad: ['#020202', '#000000'],
    particleColors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'],
    accent: '#ffffff'
  }
};

// Canvas Initialization
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.style.position = "absolute";
canvas.style.left = "0px";
canvas.style.top = "0px";
canvas.style.zIndex = "1";
document.body.style.overflow = "hidden";
const ctx = canvas.getContext("2d");

// Responsive High-DPI Canvas Resizing
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
}
resizeCanvas();

// Backwards-compatible input state
const Input = {
  keys: [],
  mouse: {
    left: false,
    right: false,
    middle: false,
    x: 0,
    y: 0
  }
};
for (let i = 0; i < 230; i++) {
  Input.keys.push(false);
}

// Event Listeners
document.addEventListener("keydown", function(event) {
  Input.keys[event.keyCode] = true;
  if (event.code === 'Space') {
    CONFIG.isPaused = !CONFIG.isPaused;
  }
});
document.addEventListener("keyup", function(event) {
  Input.keys[event.keyCode] = false;
});
document.addEventListener("mousedown", function(event) {
  if (event.button === 0) Input.mouse.left = true;
  if (event.button === 1) Input.mouse.middle = true;
  if (event.button === 2) Input.mouse.right = true;
});
document.addEventListener("mouseup", function(event) {
  if (event.button === 0) Input.mouse.left = false;
  if (event.button === 1) Input.mouse.middle = false;
  if (event.button === 2) Input.mouse.right = false;
});

// Cursor Tracking with Smoothing (lerp)
const mouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2
};

document.addEventListener("mousemove", function(event) {
  mouse.targetX = event.clientX;
  mouse.targetY = event.clientY;
  Input.mouse.x = event.clientX;
  Input.mouse.y = event.clientY;
});

function updateMouse() {
  mouse.x += (mouse.targetX - mouse.x) * 0.1;
  mouse.y += (mouse.targetY - mouse.y) * 0.1;
}

// Procedural Kinematic Classes
class Segment {
  constructor(parent, size, angle, range, stiffness) {
    this.isSegment = true;
    this.parent = parent;
    if (typeof parent.children === "object") {
      parent.children.push(this);
    }
    this.children = [];
    this.size = size;
    this.relAngle = angle;
    this.defAngle = angle;
    this.absAngle = parent.absAngle + angle;
    this.range = range;
    this.stiffness = stiffness;
    
    // Default properties for rendering
    this.segmentType = 'spine';
    this.spineIndex = 0;
    
    this.updateRelative(false, true);
  }

  updateRelative(iter, flex) {
    this.relAngle =
      this.relAngle -
      2 *
        Math.PI *
        Math.floor((this.relAngle - this.defAngle) / 2 / Math.PI + 1 / 2);
    if (flex) {
      this.relAngle = Math.min(
        this.defAngle + this.range / 2,
        Math.max(
          this.defAngle - this.range / 2,
          (this.relAngle - this.defAngle) / this.stiffness + this.defAngle
        )
      );
    }
    this.absAngle = this.parent.absAngle + this.relAngle;
    this.x = this.parent.x + Math.cos(this.absAngle) * this.size;
    this.y = this.parent.y + Math.sin(this.absAngle) * this.size;
    if (iter) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateRelative(iter, flex);
      }
    }
  }

  follow(iter) {
    const x = this.parent.x;
    const y = this.parent.y;
    const dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5;
    this.x = x + this.size * (this.x - x) / (dist || 1);
    this.y = y + this.size * (this.y - y) / (dist || 1);
    this.absAngle = Math.atan2(this.y - y, this.x - x);
    this.relAngle = this.absAngle - this.parent.absAngle;
    this.updateRelative(false, true);
    
    if (iter) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].follow(true);
      }
    }
  }

  drawSegment() {
    ctx.save();
    
    if (CONFIG.glow > 0) {
      ctx.shadowBlur = CONFIG.glow;
      ctx.shadowColor = THEMES[CONFIG.theme].glow;
    } else {
      ctx.shadowBlur = 0;
    }
    
    if (this.segmentType === 'spine') {
      const maxSpineWidth = 14 * CONFIG.scale;
      const minSpineWidth = 3 * CONFIG.scale;
      const ratio = this.spineIndex / totalSpineSegments;
      const width = maxSpineWidth - (maxSpineWidth - minSpineWidth) * ratio;
      
      // Spine connection
      ctx.beginPath();
      ctx.moveTo(this.parent.x, this.parent.y);
      ctx.lineTo(this.x, this.y);
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.strokeStyle = getColorAt(ratio, 1.0);
      ctx.stroke();
      
      // Vertebra joint node
      ctx.beginPath();
      ctx.arc(this.x, this.y, width * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = getColorAt(ratio, 0.9);
      ctx.fill();
      
    } else if (this.segmentType === 'rib') {
      const ratio = (this.parent && this.parent.spineIndex) 
        ? this.parent.spineIndex / totalSpineSegments 
        : 0.5;
      ctx.beginPath();
      ctx.moveTo(this.parent.x, this.parent.y);
      ctx.lineTo(this.x, this.y);
      ctx.lineWidth = 1.8 * CONFIG.scale;
      ctx.lineCap = 'round';
      ctx.strokeStyle = getColorAt(ratio, 0.5);
      ctx.stroke();
      
    } else if (this.segmentType === 'leg') {
      ctx.beginPath();
      ctx.moveTo(this.parent.x, this.parent.y);
      ctx.lineTo(this.x, this.y);
      ctx.lineWidth = 4.2 * CONFIG.scale;
      ctx.lineCap = 'round';
      
      const theme = THEMES[CONFIG.theme];
      let legStyle;
      if (CONFIG.theme === 'rainbow') {
        legStyle = getColorAt(0.3, 1.0);
      } else {
        legStyle = `hsl(${theme.legColor.h}, ${theme.legColor.s}%, ${theme.legColor.l}%)`;
      }
      ctx.strokeStyle = legStyle;
      ctx.stroke();
      
      // Joint node
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5 * CONFIG.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
    } else if (this.segmentType === 'finger') {
      ctx.beginPath();
      ctx.moveTo(this.parent.x, this.parent.y);
      ctx.lineTo(this.x, this.y);
      ctx.lineWidth = 1.2 * CONFIG.scale;
      ctx.lineCap = 'round';
      
      const theme = THEMES[CONFIG.theme];
      let fingerStyle;
      if (CONFIG.theme === 'rainbow') {
        fingerStyle = getColorAt(0.5, 1.0);
      } else {
        fingerStyle = `hsl(${theme.headColor.h}, ${theme.headColor.s}%, ${theme.headColor.l + 12}%)`;
      }
      ctx.strokeStyle = fingerStyle;
      ctx.stroke();
    }
    
    ctx.restore();
  }
}

class LimbSystem {
  constructor(end, length, speed, creature) {
    this.end = end;
    this.length = Math.max(1, length);
    this.creature = creature;
    this.speed = speed;
    creature.systems.push(this);
    this.nodes = [];
    let node = end;
    for (let i = 0; i < length; i++) {
      this.nodes.unshift(node);
      node = node.parent;
      if (!node.isSegment) {
        this.length = i + 1;
        break;
      }
    }
    this.hip = this.nodes[0].parent;
  }

  moveTo(x, y) {
    this.nodes[0].updateRelative(true, true);
    const dist = ((x - this.end.x) ** 2 + (y - this.end.y) ** 2) ** 0.5;
    let len = Math.max(0, dist - this.speed);
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const ang = Math.atan2(node.y - y, node.x - x);
      node.x = x + len * Math.cos(ang);
      node.y = y + len * Math.sin(ang);
      x = node.x;
      y = node.y;
      len = node.size;
    }
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      node.absAngle = Math.atan2(
        node.y - node.parent.y,
        node.x - node.parent.x
      );
      node.relAngle = node.absAngle - node.parent.absAngle;
      for (let ii = 0; ii < node.children.length; ii++) {
        const childNode = node.children[ii];
        if (!this.nodes.includes(childNode)) {
          childNode.updateRelative(true, false);
        }
      }
    }
  }

  update(x, y) {
    this.moveTo(x !== undefined ? x : mouse.x, y !== undefined ? y : mouse.y);
  }
}

class LegSystem extends LimbSystem {
  constructor(end, length, speed, creature) {
    super(end, length, speed, creature);
    this.goalX = end.x;
    this.goalY = end.y;
    this.step = 0; // 0 stand still, 1 move forward, 2 move towards foothold
    this.forwardness = 0;

    this.reach =
      0.9 *
      ((this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2) ** 0.5;
    let relAngle =
      this.creature.absAngle -
      Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x);
    relAngle -= 2 * Math.PI * Math.floor(relAngle / 2 / Math.PI + 1 / 2);
    this.swing = -relAngle + (2 * (relAngle < 0) - 1) * Math.PI / 2;
    this.swingOffset = this.creature.absAngle - this.hip.absAngle;
  }

  update(x, y) {
    this.moveTo(this.goalX, this.goalY);
    if (this.step === 0) {
      const dist =
        ((this.end.x - this.goalX) ** 2 + (this.end.y - this.goalY) ** 2) **
        0.5;
      if (dist > 1) {
        this.step = 1;
        this.goalX =
          this.hip.x +
          this.reach *
            Math.cos(this.swing + this.hip.absAngle + this.swingOffset) +
          (2 * Math.random() - 1) * this.reach / 2;
        this.goalY =
          this.hip.y +
          this.reach *
            Math.sin(this.swing + this.hip.absAngle + this.swingOffset) +
          (2 * Math.random() - 1) * this.reach / 2;
      }
    } else if (this.step === 1) {
      const theta =
        Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x) -
        this.hip.absAngle;
      const dist =
        ((this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2) **
        0.5;
      const forwardness2 = dist * Math.cos(theta);
      const dF = this.forwardness - forwardness2;
      this.forwardness = forwardness2;
      if (dF * dF < 1) {
        this.step = 0;
        this.goalX = this.hip.x + (this.end.x - this.hip.x);
        this.goalY = this.hip.y + (this.end.y - this.hip.y);
      }
    }
  }
}

class Creature {
  constructor(
    x,
    y,
    angle,
    fAccel,
    fFric,
    fRes,
    fThresh,
    rAccel,
    rFric,
    rRes,
    rThresh
  ) {
    this.x = x;
    this.y = y;
    this.absAngle = angle;
    this.fSpeed = 0;
    this.fAccel = fAccel;
    this.fFric = fFric;
    this.fRes = fRes;
    this.fThresh = fThresh;
    this.rSpeed = 0;
    this.rAccel = rAccel;
    this.rFric = rFric;
    this.rRes = rRes;
    this.rThresh = rThresh;
    this.children = [];
    this.systems = [];
  }

  update(x, y) {
    const dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5;
    const angle = Math.atan2(y - this.y, x - this.x);
    // Update forward
    let accel = this.fAccel;
    if (this.systems.length > 0) {
      let sum = 0;
      for (let i = 0; i < this.systems.length; i++) {
        sum += this.systems[i].step === 0;
      }
      accel *= sum / this.systems.length;
    }
    this.fSpeed += accel * (dist > this.fThresh);
    this.fSpeed *= 1 - this.fRes;
    this.speed = Math.max(0, this.fSpeed - this.fFric);
    
    // Update rotation
    let dif = this.absAngle - angle;
    dif -= 2 * Math.PI * Math.floor(dif / (2 * Math.PI) + 1 / 2);
    if (Math.abs(dif) > this.rThresh && dist > this.fThresh) {
      this.rSpeed -= this.rAccel * (2 * (dif > 0) - 1);
    }
    this.rSpeed *= 1 - this.rRes;
    if (Math.abs(this.rSpeed) > this.rFric) {
      this.rSpeed -= this.rFric * (2 * (this.rSpeed > 0) - 1);
    } else {
      this.rSpeed = 0;
    }

    // Update position
    this.absAngle += this.rSpeed;
    this.absAngle -=
      2 * Math.PI * Math.floor(this.absAngle / (2 * Math.PI) + 1 / 2);
    this.x += this.speed * Math.cos(this.absAngle);
    this.y += this.speed * Math.sin(this.absAngle);
    this.absAngle += Math.PI;
    
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].follow(true);
    }
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].update(x, y);
    }
    this.absAngle -= Math.PI;
  }

  drawHead() {
    ctx.save();
    
    if (CONFIG.glow > 0) {
      ctx.shadowBlur = CONFIG.glow * 1.5;
      ctx.shadowColor = THEMES[CONFIG.theme].glow;
    }
    
    const r = 8 * CONFIG.scale;
    const theme = THEMES[CONFIG.theme];
    let headColor;
    if (CONFIG.theme === 'rainbow') {
      headColor = getColorAt(0, 1.0);
    } else {
      headColor = `hsl(${theme.headColor.h}, ${theme.headColor.s}%, ${theme.headColor.l}%)`;
    }
    
    // Head shape path
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      r,
      Math.PI / 4 + this.absAngle,
      7 * Math.PI / 4 + this.absAngle
    );
    ctx.moveTo(
      this.x + r * Math.cos(7 * Math.PI / 4 + this.absAngle),
      this.y + r * Math.sin(7 * Math.PI / 4 + this.absAngle)
    );
    ctx.lineTo(
      this.x + r * Math.cos(this.absAngle) * 2 ** 0.5,
      this.y + r * Math.sin(this.absAngle) * 2 ** 0.5
    );
    ctx.lineTo(
      this.x + r * Math.cos(Math.PI / 4 + this.absAngle),
      this.y + r * Math.sin(Math.PI / 4 + this.absAngle)
    );
    ctx.fillStyle = headColor;
    ctx.fill();
    
    ctx.lineWidth = 2 * CONFIG.scale;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    
    // Eyes
    const eyeOffsetAngle = 0.55;
    const eyeDistance = r * 0.7;
    const eyeRadius = 3 * CONFIG.scale;
    
    const leftEyeX = this.x + eyeDistance * Math.cos(this.absAngle - eyeOffsetAngle);
    const leftEyeY = this.y + eyeDistance * Math.sin(this.absAngle - eyeOffsetAngle);
    const rightEyeX = this.x + eyeDistance * Math.cos(this.absAngle + eyeOffsetAngle);
    const rightEyeY = this.y + eyeDistance * Math.sin(this.absAngle + eyeOffsetAngle);
    
    ctx.shadowBlur = CONFIG.glow;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(leftEyeX, leftEyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(rightEyeX, rightEyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.restore();
  }
}

// Flat structure traversal
function getAllSegments(node, list = []) {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    list.push(child);
    getAllSegments(child, list);
  }
  return list;
}

// Theme color interpolator
function getColorAt(ratio, alpha = 1.0) {
  const theme = THEMES[CONFIG.theme];
  if (CONFIG.theme === 'rainbow') {
    const hue = (Date.now() / 25 + ratio * 360) % 360;
    return `hsla(${hue}, 100%, 50%, ${alpha})`;
  }
  
  const h = theme.headColor.h + ratio * (theme.tailColor.h - theme.headColor.h);
  const s = theme.headColor.s + ratio * (theme.tailColor.s - theme.headColor.s);
  const l = theme.headColor.l + ratio * (theme.tailColor.l - theme.headColor.l);
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
}

// Background Particle System
class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initRandom = false) {
    this.x = Math.random() * window.innerWidth;
    this.y = initRandom ? Math.random() * window.innerHeight : (Math.random() > 0.5 ? -10 : window.innerHeight + 10);
    this.size = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = -Math.random() * 0.6 - 0.2;
    
    const theme = THEMES[CONFIG.theme];
    const colors = theme.particleColors;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = Math.random() * 0.4 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    if (critter) {
      const dx = this.x - critter.x;
      const dy = this.y - critter.y;
      const dSq = dx * dx + dy * dy;
      const maxDist = 90 * CONFIG.scale;
      
      if (dSq < maxDist * maxDist) {
        const dist = Math.sqrt(dSq) || 1;
        const force = (maxDist - dist) / maxDist * 0.8;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }
    }
    
    if (this.y < -10 || this.x < -10 || this.x > window.innerWidth + 10 || this.y > window.innerHeight + 10) {
      this.reset(false);
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const particles = [];
const PARTICLE_COUNT = 70;

function initParticles() {
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

// Interactive Shockwave
class Shockwave {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = 260;
    this.speed = 7;
    this.alpha = 1.0;
  }

  update() {
    this.radius += this.speed;
    this.alpha = 1.0 - (this.radius / this.maxRadius);
    
    particles.forEach(p => {
      const dx = p.x - this.x;
      const dy = p.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (Math.abs(dist - this.radius) < 30) {
        const push = (1.0 - (this.radius / this.maxRadius)) * 5;
        p.x += (dx / dist) * push;
        p.y += (dy / dist) * push;
      }
    });
    
    if (critter) {
      const segments = getAllSegments(critter);
      segments.forEach(seg => {
        const dx = seg.x - this.x;
        const dy = seg.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (Math.abs(dist - this.radius) < 40) {
          const push = (1.0 - (this.radius / this.maxRadius)) * 2.5;
          seg.x += (dx / dist) * push;
          seg.y += (dy / dist) * push;
        }
      });
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = THEMES[CONFIG.theme].accent;
    ctx.lineWidth = 3;
    if (CONFIG.glow > 0) {
      ctx.shadowBlur = CONFIG.glow;
      ctx.shadowColor = THEMES[CONFIG.theme].glow;
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

const shockwaves = [];
canvas.addEventListener('click', (e) => {
  if (e.target.closest('#uiPanel') || e.target.closest('#toggleUiBtn')) return;
  shockwaves.push(new Shockwave(e.clientX, e.clientY));
});

// Initialization & Dynamic Generation
let critter;
let totalSpineSegments = 0;

function initCreature() {
  const s = CONFIG.scale * (8 / Math.sqrt(CONFIG.legCount));
  const prevX = critter ? critter.x : window.innerWidth / 2;
  const prevY = critter ? critter.y : window.innerHeight / 2;
  const prevAngle = critter ? critter.absAngle : 0;
  
  critter = new Creature(
    prevX,
    prevY,
    prevAngle,
    s * 10 * CONFIG.speed,
    s * 2,
    0.5,
    16,
    0.5,
    0.085,
    0.5,
    0.3
  );
  
  let spinal = critter;
  spinal.segmentType = 'spine';
  spinal.spineIndex = 0;
  
  // 1. Neck
  const neckLength = 6;
  for (let i = 0; i < neckLength; i++) {
    spinal = new Segment(spinal, s * 4, 0, Math.PI * 2 / 3, 1.1);
    spinal.segmentType = 'spine';
    spinal.spineIndex = i + 1;
    
    for (let ii = -1; ii <= 1; ii += 2) {
      let node = new Segment(spinal, s * 3, ii, 0.1, 2);
      node.segmentType = 'rib';
      for (let iii = 0; iii < 3; iii++) {
        node = new Segment(node, s * 0.1, -ii * 0.1, 0.1, 2);
        node.segmentType = 'rib';
      }
    }
  }
  
  // 2. Torso and Legs
  let currentSpineIndex = neckLength + 1;
  for (let i = 0; i < CONFIG.legCount; i++) {
    if (i > 0) {
      for (let ii = 0; ii < 6; ii++) {
        spinal = new Segment(spinal, s * 4, 0, 1.571, 1.5);
        spinal.segmentType = 'spine';
        spinal.spineIndex = currentSpineIndex++;
        
        for (let iii = -1; iii <= 1; iii += 2) {
          let node = new Segment(spinal, s * 3, iii * 1.571, 0.1, 1.5);
          node.segmentType = 'rib';
          for (let iv = 0; iv < 3; iv++) {
            node = new Segment(node, s * 3, -iii * 0.3, 0.1, 2);
            node.segmentType = 'rib';
          }
        }
      }
    }
    
    // Hip, Leg & Shoulder elements
    for (let ii = -1; ii <= 1; ii += 2) {
      let node = new Segment(spinal, s * 12, ii * 0.785, 0, 8);
      node.segmentType = 'leg';
      node = new Segment(node, s * 16, -ii * 0.785, Math.PI * 2, 1);
      node.segmentType = 'leg';
      node = new Segment(node, s * 16, ii * 1.571, Math.PI, 2);
      node.segmentType = 'leg';
      
      for (let iii = 0; iii < 4; iii++) {
        let finger = new Segment(node, s * 4, (iii / 3 - 0.5) * 1.571, 0.1, 4);
        finger.segmentType = 'finger';
      }
      new LegSystem(node, 3, s * 12, critter, 4);
    }
  }
  
  // 3. Tail
  for (let i = 0; i < CONFIG.tailLength; i++) {
    spinal = new Segment(spinal, s * 4, 0, Math.PI * 2 / 3, 1.1);
    spinal.segmentType = 'spine';
    spinal.spineIndex = currentSpineIndex++;
    
    for (let ii = -1; ii <= 1; ii += 2) {
      let node = new Segment(spinal, s * 3, ii, 0.1, 2);
      node.segmentType = 'rib';
      for (let iii = 0; iii < 3; iii++) {
        node = new Segment(node, s * 3 * (CONFIG.tailLength - i) / CONFIG.tailLength, -ii * 0.1, 0.1, 2);
        node.segmentType = 'rib';
      }
    }
  }
  
  totalSpineSegments = currentSpineIndex;
}

// User Interface Integration
function setupUI() {
  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      CONFIG.theme = btn.dataset.preset;
      
      const theme = THEMES[CONFIG.theme];
      document.documentElement.style.setProperty('--accent-color', theme.accent);
      document.documentElement.style.setProperty('--accent-glow', theme.glow);
      
      particles.forEach(p => p.reset(true));
    });
  });

  const setupSlider = (id, configKey, valId, isRebuild = false) => {
    const slider = document.getElementById(id);
    const valDisplay = document.getElementById(valId);
    if (!slider || !valDisplay) return;
    
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      CONFIG[configKey] = val;
      valDisplay.textContent = val;
      if (isRebuild) {
        initCreature();
      }
    });
  };

  setupSlider('legCount', 'legCount', 'legCountVal', true);
  setupSlider('tailLength', 'tailLength', 'tailLengthVal', true);
  setupSlider('creatureScale', 'scale', 'creatureScaleVal', true);
  setupSlider('maxSpeed', 'speed', 'maxSpeedVal', true);
  setupSlider('glow', 'glow', 'glowVal');

  const setupToggle = (id, configKey) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    toggle.addEventListener('change', (e) => {
      CONFIG[configKey] = e.target.checked;
    });
  };

  setupToggle('showParticles', 'showParticles');
  setupToggle('drawRibs', 'drawRibs');

  const toggleUiBtn = document.getElementById('toggleUiBtn');
  const uiPanel = document.getElementById('uiPanel');
  if (toggleUiBtn && uiPanel) {
    toggleUiBtn.addEventListener('click', () => {
      uiPanel.classList.toggle('collapsed');
      toggleUiBtn.classList.toggle('active');
    });
  }
}

// Draw Frame Render pass
function draw() {
  const theme = THEMES[CONFIG.theme];
  let bgGrad = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  if (CONFIG.theme === 'rainbow') {
    bgGrad.addColorStop(0, '#020202');
    bgGrad.addColorStop(1, '#000000');
  } else {
    bgGrad.addColorStop(0, theme.bgGrad[0]);
    bgGrad.addColorStop(1, theme.bgGrad[1]);
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  
  if (CONFIG.showParticles) {
    particles.forEach(p => p.draw());
  }
  
  shockwaves.forEach(sw => sw.draw());
  
  if (critter) {
    const segments = getAllSegments(critter);
    
    // Draw limbs
    const legs = segments.filter(s => s.segmentType === 'leg' || s.segmentType === 'finger');
    legs.forEach(s => s.drawSegment());
    
    // Draw ribs
    if (CONFIG.drawRibs) {
      const ribs = segments.filter(s => s.segmentType === 'rib');
      ribs.forEach(s => s.drawSegment());
    }
    
    // Draw spine vertebrae
    const spine = segments.filter(s => s.segmentType === 'spine');
    spine.forEach(s => s.drawSegment());
    
    // Draw head on top
    critter.drawHead();
  }
}

// Time-decoupled physics updates accumulator
let lastTime = 0;
let accumulator = 0;
const deltaTime = 1000 / 60; // 60 FPS update tick

function animate(currentTime) {
  requestAnimationFrame(animate);
  
  if (CONFIG.isPaused) return;
  
  if (!lastTime) lastTime = currentTime;
  let elapsed = currentTime - lastTime;
  if (elapsed > 100) elapsed = 100; // Cap to avoid freeze spirals
  lastTime = currentTime;
  
  accumulator += elapsed;
  
  // Smooth mouse coordinates
  updateMouse();
  
  // Fixed step physics loop
  while (accumulator >= deltaTime) {
    if (critter) {
      critter.update(mouse.x, mouse.y);
    }
    
    if (CONFIG.showParticles) {
      particles.forEach(p => p.update());
    }
    
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwaves[i].update();
      if (shockwaves[i].alpha <= 0) {
        shockwaves.splice(i, 1);
      }
    }
    
    accumulator -= deltaTime;
  }
  
  // Draw the current state
  draw();
}

// Start Execution
initCreature();
initParticles();
setupUI();
requestAnimationFrame((time) => {
  lastTime = time;
  animate(time);
});

// Resize Handler
window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});