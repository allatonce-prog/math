/**
 * scratchpad.js
 * Handles the drawing canvas overlay for "Chalkboard" mode.
 */

export class Scratchpad {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        this.isDrawing = false;

        this.init();
    }

    init() {
        this.canvas.id = 'scratchpad-canvas';
        this.canvas.className = 'scratchpad hidden';
        this.container.appendChild(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Mouse Events
        this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDraw());
        this.canvas.addEventListener('mouseout', () => this.stopDraw());

        // Touch Events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDraw(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.stopDraw());
    }

    resize() {
        // Match container size
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        // Reset styles after resize
        this.ctx.strokeStyle = '#ff6b6b'; // Chalk color
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    toggle() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.canvas.classList.remove('hidden');
            this.resize(); // Ensure size is correct upon showing
        } else {
            this.canvas.classList.add('hidden');
            this.clear();
        }
        return this.isActive;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDraw(e) {
        if (!this.isActive) return;
        this.isDrawing = true;
        const pos = this.getPos(e);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }

    draw(e) {
        if (!this.isDrawing || !this.isActive) return;
        const pos = this.getPos(e);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    }

    stopDraw() {
        this.isDrawing = false;
    }
}
