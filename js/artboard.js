/**
 * artboard.js
 * Specialized drawing board with colors and brush sizes.
 */

export class ArtBoard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;

        // Settings
        this.color = '#ff6b6b';
        this.size = 5;
        this.isEraser = false;

        this.init();
    }

    init() {
        // Handle resizing
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Events
        this.canvas.addEventListener('mousedown', (e) => this.start(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stop());
        this.canvas.addEventListener('mouseout', () => this.stop());

        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.start(e.touches[0]); }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e.touches[0]); }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.stop());
    }

    resize() {
        // Save current content
        const data = this.canvas.toDataURL();
        const img = new Image();
        img.src = data;

        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Restore content after resize
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
        };
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    start(e) {
        this.isDrawing = true;
        const pos = this.getPos(e);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);

        this.ctx.lineWidth = this.size;
        this.ctx.strokeStyle = this.isEraser ? '#ffffff' : this.color;
    }

    draw(e) {
        if (!this.isDrawing) return;
        const pos = this.getPos(e);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    }

    stop() {
        this.isDrawing = false;
    }

    setColor(c) {
        this.color = c;
        this.isEraser = false;
    }

    setSize(s) {
        this.size = s;
    }

    setEraser() {
        this.isEraser = true;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
