/* ==========================================================================
   Interactive Background Particle System
   ========================================================================== */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 55;
        this.mouse = { x: null, y: null, radius: 140 };

        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    init() {
        this.resize();
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(isNew = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: isNew ? this.canvas.height + 10 : Math.random() * this.canvas.height,
            size: Math.random() * 2 + 1,
            speedX: Math.random() * 0.3 - 0.15,
            speedY: Math.random() * -0.4 - 0.1,
            color: Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(157, 78, 221, 0.4)',
            alpha: Math.random() * 0.5 + 0.2
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((p, idx) => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (this.mouse.x !== null && this.mouse.y !== null) {
                let dx = p.x - this.mouse.x;
                let dy = p.y - this.mouse.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    let force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x += (dx / dist) * force * 1.2;
                    p.y += (dy / dist) * force * 1.2;
                }
            }

            if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
                this.particles[idx] = this.createParticle(true);
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fill();
        });

        // Connection Lines
        this.ctx.globalAlpha = 0.06;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                let dx = this.particles[i].x - this.particles[j].x;
                let dy = this.particles[i].y - this.particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 90) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = '#00f2fe';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.globalAlpha = 1.0;

        requestAnimationFrame(() => this.animate());
    }
}

/* ==========================================================================
   Confetti Explosion System (Dynamic Match Spray)
   ========================================================================== */

class ConfettiSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.active = false;
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    spray(targetX, targetY) {
        this.resize();
        this.active = true;
        const colors = ['#00f2fe', '#00f076', '#ff007f', '#ff9f1c', '#9d4edd', '#ffff00'];
        
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                x: targetX,
                y: targetY,
                size: Math.random() * 5 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: Math.random() * 10 - 5,
                speedY: Math.random() * -10 - 3,
                gravity: 0.3,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 8 - 4,
                opacity: 1
            });
        }
        
        if (this.particles.length === 60) {
            this.animate();
        }
    }

    animate() {
        if (!this.active || this.particles.length === 0) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((p, idx) => {
            p.speedY += p.gravity;
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.015;
            
            if (p.opacity <= 0) {
                this.particles.splice(idx, 1);
                return;
            }
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();
        });
        
        requestAnimationFrame(() => this.animate());
    }

    clear() {
        this.active = false;
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

/* ==========================================================================
   Web Audio API Sound Synthesis Engine
   ========================================================================== */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    toggleMute(isMuted) {
        this.muted = isMuted;
    }

    playTick() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    playCheck() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5 tone
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playFail() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
    }

    playSuccess() {
        if (this.muted) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
        notes.forEach((freq, index) => {
            setTimeout(() => {
                if (this.muted) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 0.4);
            }, index * 75);
        });
    }

    playReset() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }
}

/* ==========================================================================
   Main Application Visualization & Algorithm State Logic
   ========================================================================== */

class App {
    constructor() {
        this.particles = new ParticleSystem('bg-particles');
        this.confetti = new ConfettiSystem('confetti-canvas');
        this.audio = new AudioEngine();
        
        // Element caching
        this.arrayContainer = document.getElementById('array-container');
        this.arrayPointer = document.getElementById('array-pointer');
        this.pointerIndexVal = document.getElementById('pointer-index-val');
        this.arrayInput = document.getElementById('array-input');
        this.targetInput = document.getElementById('target-input');
        
        this.speedSlider = document.getElementById('speed-slider');
        this.speedDisplay = document.getElementById('speed-display');
        this.modeAuto = document.getElementById('mode-auto');
        this.modeStep = document.getElementById('mode-step');
        
        // Log & pseudocode highlighter
        this.explanationText = document.getElementById('explanation-text');
        this.codeHighlighter = document.getElementById('code-highlighter');
        
        // Stats
        this.statIndex = document.getElementById('stat-index');
        this.statComparisons = document.getElementById('stat-comparisons');
        this.statTarget = document.getElementById('stat-target');
        this.statSize = document.getElementById('stat-size');
        this.progressPercentage = document.getElementById('progress-percentage');
        this.progressFill = document.getElementById('progress-fill');
        
        // Footer elements
        this.footerStatus = document.getElementById('footer-status');
        this.footerSpeed = document.getElementById('footer-speed');
        this.footerTimer = document.getElementById('footer-timer');
        this.footerResult = document.getElementById('footer-result');
        this.statusIndicatorDot = document.getElementById('status-indicator-dot');
        
        // Controls
        this.btnGenerate = document.getElementById('btn-generate');
        this.btnStart = document.getElementById('btn-start');
        this.btnNext = document.getElementById('btn-next');
        this.btnReset = document.getElementById('btn-reset');
        this.startBtnText = document.getElementById('start-btn-text');
        
        // Utilities
        this.btnSound = document.getElementById('btn-sound');
        this.btnFullscreen = document.getElementById('btn-fullscreen');
        this.btnTheme = document.getElementById('btn-theme');
        this.btnRecord = document.getElementById('btn-record');
        
        // Outcome overlays
        this.successScreen = document.getElementById('success-screen');
        this.successIndexDisplay = document.getElementById('success-index-display');
        this.successComparisonsVal = document.getElementById('success-comparisons-val');
        this.successCloseBtn = document.getElementById('success-close-btn');
        
        this.failScreen = document.getElementById('fail-screen');
        this.failComparisonsVal = document.getElementById('fail-comparisons-val');
        this.failCloseBtn = document.getElementById('fail-close-btn');

        // States
        this.array = [];
        this.target = null;
        this.state = 'IDLE'; // IDLE, RUNNING, PAUSED, SUCCESS, FAILED
        this.currentIndex = -1;
        this.comparisons = 0;
        this.speed = 1.0;
        this.mode = 'auto'; // auto, step
        this.isTyping = false;
        
        // Microsecond Elapsed Timer properties
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        
        // Execution step timer loop
        this.stepTimer = null;
        this.currentStepPhase = 0; // Phase: 0 = Move pointer, 1 = Value retrieve, 2 = Compare, 3 = Inc Index
        
        // Recording options
        this.recorder = null;
        this.recordedChunks = [];
        
        this.initEvents();
        
        // Initialize dashboard state directly on load
        this.resetVisualization();
    }

    initEvents() {
        // Inputs Validation & Config updates
        this.arrayInput.addEventListener('change', () => this.resetVisualization());
        this.targetInput.addEventListener('change', () => this.resetVisualization());
        this.speedSlider.addEventListener('input', (e) => this.updateSpeed(parseFloat(e.target.value)));
        
        this.modeAuto.addEventListener('click', () => this.switchMode('auto'));
        this.modeStep.addEventListener('click', () => this.switchMode('step'));
        
        // Action buttons bindings
        this.btnGenerate.addEventListener('click', () => this.generateRandomArray());
        this.btnStart.addEventListener('click', () => this.toggleSearch());
        this.btnNext.addEventListener('click', () => this.executeStep());
        this.btnReset.addEventListener('click', () => this.resetVisualization());
        
        // Key bindings
        window.addEventListener('keydown', (e) => this.handleShortcuts(e));
        window.addEventListener('resize', () => {
            if (this.currentIndex !== -1 && this.state !== 'IDLE') {
                this.movePointer(this.currentIndex);
            }
        });
        
        // Utility icons triggers
        this.btnSound.addEventListener('click', () => this.toggleSound());
        this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
        this.btnTheme.addEventListener('click', () => this.toggleTheme());
        this.btnRecord.addEventListener('click', () => this.toggleRecording());
        
        // Modal buttons
        this.successCloseBtn.addEventListener('click', () => this.dismissModal(this.successScreen));
        this.failCloseBtn.addEventListener('click', () => this.dismissModal(this.failScreen));
    }

    /* ==========================================================================
       Shortcuts & Control Toggles
       ========================================================================== */

    handleShortcuts(e) {
        if (document.activeElement.tagName === 'INPUT') return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            this.toggleSearch();
        } else if (e.code === 'KeyS' || e.code === 'ArrowRight') {
            e.preventDefault();
            if (this.mode === 'step') this.executeStep();
        } else if (e.code === 'KeyR') {
            e.preventDefault();
            this.resetVisualization();
        } else if (e.code === 'KeyN') {
            e.preventDefault();
            this.generateRandomArray();
        } else if (e.code === 'KeyF') {
            e.preventDefault();
            this.toggleFullscreen();
        }
    }

    toggleSound() {
        const isMuted = this.btnSound.classList.contains('active');
        this.btnSound.classList.toggle('active', !isMuted);
        this.audio.toggleMute(isMuted);
        
        const soundOnIcon = this.btnSound.querySelector('.sound-on');
        const soundOffIcon = this.btnSound.querySelector('.sound-off');
        soundOnIcon.classList.toggle('hidden', isMuted);
        soundOffIcon.classList.toggle('hidden', !isMuted);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Fullscreen request failed: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        
        const sunIcon = this.btnTheme.querySelector('.sun-icon');
        const moonIcon = this.btnTheme.querySelector('.moon-icon');
        sunIcon.classList.toggle('hidden', nextTheme === 'dark');
        moonIcon.classList.toggle('hidden', nextTheme === 'light');
    }

    updateSpeed(value) {
        this.speed = value;
        this.speedDisplay.textContent = `${value.toFixed(1)}x`;
        this.footerSpeed.textContent = `${value.toFixed(1)}x`;
    }

    switchMode(mode) {
        this.mode = mode;
        this.modeAuto.classList.toggle('active', mode === 'auto');
        this.modeStep.classList.toggle('active', mode === 'step');
        
        if (mode === 'step') {
            this.btnNext.classList.remove('hidden');
            if (this.state === 'RUNNING') {
                this.pauseSearch();
            }
        } else {
            this.btnNext.classList.add('hidden');
            if (this.state === 'PAUSED') {
                this.toggleSearch();
            }
        }
        this.audio.playTick();
    }

    /* ==========================================================================
       Media Capture and Export webm/mp4 sequence
       ========================================================================== */

    async toggleRecording() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.recorder.stop();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: "browser" },
                audio: false
            });

            this.recordedChunks = [];
            this.recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

            this.recorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.recordedChunks.push(e.data);
            };

            this.recorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Linear_Search_Console_${Date.now()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
                this.btnRecord.classList.remove('recording');
                stream.getTracks().forEach(track => track.stop());
            };

            this.recorder.start();
            this.btnRecord.classList.add('recording');
        } catch (err) {
            console.error("Tab recording initiation failed: ", err);
        }
    }

    /* ==========================================================================
       Array Visualizer DOM Renderer
       ========================================================================== */

    generateRandomArray() {
        this.audio.playReset();
        const size = Math.floor(Math.random() * 4) + 6; // 6 to 9 items (keeps items visible within width constraints)
        const generated = [];
        for (let i = 0; i < size; i++) {
            generated.push(Math.floor(Math.random() * 90) + 10);
        }
        this.arrayInput.value = generated.join(',');
        
        if (Math.random() > 0.15) {
            this.targetInput.value = generated[Math.floor(Math.random() * generated.length)];
        } else {
            this.targetInput.value = Math.floor(Math.random() * 90) + 10;
        }

        this.resetVisualization();
    }

    resetVisualization() {
        // Clear loops and canvas confettis
        if (this.stepTimer) clearTimeout(this.stepTimer);
        this.stopTimer();
        this.confetti.clear();

        // Clear states
        this.state = 'IDLE';
        this.currentIndex = -1;
        this.comparisons = 0;
        this.currentStepPhase = 0;
        this.elapsedTime = 0;
        
        this.updateStatusDisplay();

        // Inputs Validation
        const rawArray = this.arrayInput.value
            .split(',')
            .map(x => parseInt(x.trim()))
            .filter(x => !isNaN(x));
            
        this.array = rawArray;
        this.target = parseInt(this.targetInput.value);

        if (isNaN(this.target) || this.array.length === 0) {
            this.writeLog("> Error: Input arrays or target value is invalid.");
            return;
        }

        // Render card nodes
        this.arrayContainer.innerHTML = '';
        this.array.forEach((val, idx) => {
            const card = document.createElement('div');
            card.className = 'array-card animate-entry';
            card.style.animationDelay = `${idx * 0.05}s`;
            card.id = `array-card-${idx}`;
            card.innerHTML = `
                <span class="card-value">${val}</span>
                <span class="card-index">${idx}</span>
            `;
            this.arrayContainer.appendChild(card);
        });

        // Hide pointer and code highlight lines
        this.arrayPointer.classList.add('hidden');
        this.highlightCodeLine(0);

        // Reset display widgets
        this.statIndex.textContent = '—';
        this.statComparisons.textContent = '0';
        this.statTarget.textContent = this.target;
        this.statSize.textContent = this.array.length;
        
        this.progressPercentage.textContent = '0%';
        this.progressFill.style.width = '0%';
        
        this.footerTimer.textContent = '00:00.00';
        this.footerResult.textContent = '—';
        this.footerResult.className = 'footer-val result-badge';

        // Action controls restoration
        this.btnStart.classList.remove('danger');
        this.btnStart.classList.add('primary');
        this.btnStart.disabled = false;
        this.startBtnText.textContent = 'Start Search';
        
        const playIcon = this.btnStart.querySelector('.play-icon');
        const pauseIcon = this.btnStart.querySelector('.pause-icon');
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');

        this.writeLog(`> Dashboard initialized. Array size: ${this.array.length}. Target: ${this.target}. Ready.`);
    }

    /* ==========================================================================
       Code Highlight Pill Transition
       ========================================================================== */

    highlightCodeLine(lineNum) {
        document.querySelectorAll('.code-line').forEach(el => el.classList.remove('highlighted'));
        
        if (lineNum === 0) {
            this.codeHighlighter.style.opacity = '0';
            return;
        }

        const targetLine = document.getElementById(`code-line-${lineNum}`);
        if (!targetLine) return;

        targetLine.classList.add('highlighted');
        this.codeHighlighter.style.opacity = '1';
        
        const containerRect = targetLine.parentElement.getBoundingClientRect();
        const lineRect = targetLine.getBoundingClientRect();
        const relativeTop = lineRect.top - containerRect.top;
        
        this.codeHighlighter.style.transform = `translateY(${relativeTop}px)`;
        this.codeHighlighter.style.height = `${lineRect.height}px`;
    }

    /* ==========================================================================
       Log Terminal typing
       ========================================================================== */

    writeLog(text) {
        if (this.isTyping) {
            this.explanationText.innerHTML += `<br>${text}`;
            this.scrollLog();
            return;
        }

        this.isTyping = true;
        this.explanationText.innerHTML = '';
        let index = 0;
        
        const typeChar = () => {
            if (index < text.length) {
                this.explanationText.innerHTML += text[index++];
                requestAnimationFrame(typeChar);
            } else {
                this.isTyping = false;
                this.scrollLog();
            }
        };
        typeChar();
    }

    scrollLog() {
        const content = this.explanationText.parentElement;
        content.scrollTop = content.scrollHeight;
    }

    /* ==========================================================================
       Elapsed Timer Milliseconds Engine
       ========================================================================== */

    startTimer() {
        this.startTime = performance.now() - this.elapsedTime;
        this.timerInterval = requestAnimationFrame(this.updateTimer.bind(this));
    }

    stopTimer() {
        if (this.timerInterval) {
            cancelAnimationFrame(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        if (this.state !== 'RUNNING') return;
        
        const now = performance.now();
        const diff = now - this.startTime;
        this.elapsedTime = diff;
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const centiseconds = Math.floor((diff % 1000) / 10);
        
        const pad = (num, size = 2) => ('00' + num).slice(-size);
        this.footerTimer.textContent = `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
        
        this.timerInterval = requestAnimationFrame(this.updateTimer.bind(this));
    }

    /* ==========================================================================
       Search State Triggers
       ========================================================================== */

    toggleSearch() {
        if (this.state === 'SUCCESS' || this.state === 'FAILED') {
            // Act as Replay if visualization has finished
            this.resetVisualization();
            setTimeout(() => this.startSearch(), 100);
            return;
        }

        if (this.state === 'IDLE' || this.state === 'PAUSED') {
            this.startSearch();
        } else if (this.state === 'RUNNING') {
            this.pauseSearch();
        }
    }

    startSearch() {
        if (this.array.length === 0) return;
        this.audio.init();

        this.state = 'RUNNING';
        this.updateStatusDisplay();
        this.startTimer();

        const playIcon = this.btnStart.querySelector('.play-icon');
        const pauseIcon = this.btnStart.querySelector('.pause-icon');
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        this.startBtnText.textContent = 'Pause';
        
        if (this.currentIndex === -1) {
            this.currentIndex = 0;
            this.currentStepPhase = 0;
        }

        this.writeLog(`> Starting search loop...`);
        this.executeVisualizationLoop();
    }

    pauseSearch() {
        this.state = 'PAUSED';
        this.updateStatusDisplay();
        this.stopTimer();

        const playIcon = this.btnStart.querySelector('.play-icon');
        const pauseIcon = this.btnStart.querySelector('.pause-icon');
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        this.startBtnText.textContent = 'Resume';
        
        if (this.stepTimer) clearTimeout(this.stepTimer);
        this.writeLog(`> Visualization PAUSED.`);
    }

    updateStatusDisplay() {
        this.footerStatus.textContent = this.state;
        this.footerStatus.className = `status-badge ${this.state.toLowerCase()}`;
    }

    executeStep() {
        if (this.state === 'SUCCESS' || this.state === 'FAILED') return;
        this.audio.init();
        
        if (this.state !== 'PAUSED' && this.state !== 'IDLE') {
            this.pauseSearch();
        }

        this.state = 'PAUSED';
        this.updateStatusDisplay();
        this.stopTimer();

        if (this.currentIndex === -1) {
            this.currentIndex = 0;
            this.currentStepPhase = 0;
        }

        this.processStepCycle();
    }

    /* ==========================================================================
     Algorithm State execution loop
     ========================================================================== */

    executeVisualizationLoop() {
        if (this.state !== 'RUNNING') return;

        this.processStepCycle();

        const baseInterval = 1100;
        const delay = baseInterval / this.speed;

        this.stepTimer = setTimeout(() => {
            this.executeVisualizationLoop();
        }, delay);
    }

    processStepCycle() {
        if (this.currentIndex >= this.array.length) {
            this.handleSearchFailure();
            return;
        }

        const card = document.getElementById(`array-card-${this.currentIndex}`);
        const currentValue = this.array[this.currentIndex];

        switch (this.currentStepPhase) {
            case 0:
                // Shift arrow indicator and highlight loop range line
                this.highlightCodeLine(2);
                this.movePointer(this.currentIndex);
                this.audio.playTick();
                
                document.querySelectorAll('.array-card').forEach(el => el.classList.remove('checking', 'comparing'));
                card.classList.add('checking');
                this.statIndex.textContent = this.currentIndex;
                
                // Update Progress percentage
                const progressRatio = this.currentIndex / this.array.length;
                this.progressFill.style.width = `${progressRatio * 100}%`;
                this.progressPercentage.textContent = `${Math.round(progressRatio * 100)}%`;

                this.writeLog(`> Moving pointer: checking element index i = ${this.currentIndex}.`);
                this.currentStepPhase = 1;
                break;

            case 1:
                // Value extraction highlight
                this.highlightCodeLine(3);
                this.audio.playCheck();
                card.classList.remove('checking');
                card.classList.add('comparing');
                
                this.writeLog(`> Fetch value: array[${this.currentIndex}] = ${currentValue}.`);
                this.currentStepPhase = 2;
                break;

            case 2:
                // Compare check
                this.highlightCodeLine(4);
                this.comparisons++;
                this.statComparisons.textContent = this.comparisons;

                if (currentValue === this.target) {
                    this.handleSearchSuccess(card);
                } else {
                    this.audio.playFail();
                    card.classList.remove('comparing');
                    card.classList.add('wrong');
                    
                    this.writeLog(`> Compare mismatch: ${currentValue} != ${this.target}. Shake card.`);
                    this.currentStepPhase = 3;
                }
                break;

            case 3:
                // Clear animations and increment index
                card.classList.remove('wrong');
                card.classList.add('wrong-fade');
                
                this.currentIndex++;
                this.currentStepPhase = 0;
                
                if (this.currentIndex >= this.array.length) {
                    this.handleSearchFailure();
                } else {
                    this.writeLog(`> Increment index to index: ${this.currentIndex}`);
                }
                break;
        }
    }

    /* ==========================================================================
       Pointer translations positioning
       ========================================================================== */

    movePointer(index) {
        const card = document.getElementById(`array-card-${index}`);
        if (!card) return;

        this.arrayPointer.classList.remove('hidden');
        this.pointerIndexVal.textContent = index;

        const relativeLeft = card.offsetLeft;

        // Apply hardware accelerated transition transformations
        this.arrayPointer.style.transform = `translate3d(${relativeLeft}px, 0px, 0)`;
        
        // Keep active card centered
        const scrollContainer = this.arrayContainer.parentElement;
        const scrollTarget = card.offsetLeft - (scrollContainer.clientWidth / 2) + (card.clientWidth / 2);
        
        scrollContainer.scrollTo({
            left: scrollTarget,
            behavior: 'smooth'
        });
    }

    /* ==========================================================================
       Success / Fail outcomes
       ========================================================================== */

    handleSearchSuccess(card) {
        if (this.stepTimer) clearTimeout(this.stepTimer);
        this.stopTimer();

        this.state = 'SUCCESS';
        this.updateStatusDisplay();
        this.highlightCodeLine(5);

        // Style target card match
        card.classList.remove('comparing');
        card.classList.add('matched');

        // Confetti explosion coordinates
        const sprayX = card.offsetLeft + card.clientWidth / 2;
        const sprayY = card.offsetTop + card.clientHeight / 2;
        this.confetti.spray(sprayX, sprayY);
        this.audio.playSuccess();

        // Footer changes
        this.footerResult.textContent = `FOUND AT INDEX ${this.currentIndex}`;
        this.footerResult.className = 'footer-val result-badge success';

        this.progressFill.style.width = '100%';
        this.progressPercentage.textContent = '100%';

        this.writeLog(`> Target located! Match found at index = ${this.currentIndex}. Return index.`);
        this.btnStart.disabled = true;

        setTimeout(() => {
            if (this.state !== 'SUCCESS') return;
            this.successIndexDisplay.textContent = this.currentIndex;
            this.successComparisonsVal.textContent = this.comparisons;
            this.successScreen.classList.add('active');
        }, 1100);
    }

    handleSearchFailure() {
        if (this.stepTimer) clearTimeout(this.stepTimer);
        this.stopTimer();

        this.state = 'FAILED';
        this.updateStatusDisplay();
        this.highlightCodeLine(6);
        this.audio.playFail();

        // Footer changes
        this.footerResult.textContent = 'NOT FOUND';
        this.footerResult.className = 'footer-val result-badge failed';

        this.writeLog(`> All items checked. Element not in array range. Return -1.`);
        this.btnStart.disabled = true;

        setTimeout(() => {
            if (this.state !== 'FAILED') return;
            this.failComparisonsVal.textContent = this.comparisons;
            this.failScreen.classList.add('active');
        }, 800);
    }

    dismissModal(overlay) {
        overlay.classList.remove('active');
    }
}

// Instantiate visualizer
document.addEventListener('DOMContentLoaded', () => {
    window.visualApp = new App();
});
