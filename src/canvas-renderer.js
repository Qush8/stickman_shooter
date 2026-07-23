/** Pure Canvas 2D renderer — PixiJS-compatible subset for ui.js migration. */

export const LINE_CAP = { ROUND: 'round', BUTT: 'butt' };

const hexToRgba = (hex, alpha = 1) => {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return `rgba(${r},${g},${b},${alpha})`;
};

const makeVec2 = () => ({
    x: 0,
    y: 0,
    set(a, b) {
        if (typeof a === 'object' && a !== null) {
            this.x = a.x ?? 0;
            this.y = a.y ?? 0;
        } else if (b !== undefined) {
            this.x = a;
            this.y = b;
        } else {
            this.x = a;
            this.y = a;
        }
    },
});

/** Display object base — position, scale, alpha, visibility. */
class DisplayObject {
    constructor() {
        this.position = makeVec2();
        this.scale = makeVec2();
        this.scale.set(1);
        this.alpha = 1;
        this.visible = true;
        this.rotation = 0;
        this.parent = null;
    }

    render(_ctx) {}

    destroy() {}
}

/** Pixi Container → layered transform group with ordered children. */
export class CanvasLayer extends DisplayObject {
    constructor() {
        super();
        this.children = [];
    }

    addChild(child) {
        if (child.parent === this) return child;
        if (child.parent) child.parent.removeChild(child);
        child.parent = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        const i = this.children.indexOf(child);
        if (i >= 0) {
            this.children.splice(i, 1);
            child.parent = null;
        }
        return child;
    }

    removeChildren() {
        for (const child of this.children) child.parent = null;
        this.children.length = 0;
    }

    render(ctx) {
        if (!this.visible || this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha *= this.alpha;
        ctx.translate(this.position.x, this.position.y);
        if (this.rotation) ctx.rotate(this.rotation);
        ctx.scale(this.scale.x, this.scale.y);
        for (const child of this.children) {
            if (child.render) child.render(ctx);
        }
        ctx.restore();
    }
}

/** Pixi Graphics → command-recording Canvas 2D adapter. */
export class CanvasGraphics extends DisplayObject {
    constructor() {
        super();
        this.commands = [];
        this.blendMode = 'normal';
        this._path = [];
        this._hasPath = false;
        this._fillColor = null;
        this._fillAlpha = 1;
        this._lineWidth = 0;
        this._lineColor = 0xffffff;
        this._lineAlpha = 1;
        this._lineCap = 'round';
    }

    clear() {
        this.commands = [];
        this._path = [];
        this._hasPath = false;
        this._fillColor = null;
        this._lineWidth = 0;
    }

    _lineState() {
        return {
            width: this._lineWidth,
            color: this._lineColor,
            alpha: this._lineAlpha,
            cap: this._lineCap,
        };
    }

    _strokeCurrentPath() {
        if (!this._hasPath || this._lineWidth <= 0) {
            this._path = [];
            this._hasPath = false;
            return;
        }
        this.commands.push({
            type: 'strokePath',
            path: this._path.slice(),
            ...this._lineState(),
        });
        this._path = [];
        this._hasPath = false;
    }

    _fillCurrentPath() {
        if (!this._hasPath || this._fillColor === null) return;
        this.commands.push({
            type: 'fillPath',
            path: this._path.slice(),
            color: this._fillColor,
            alpha: this._fillAlpha,
        });
        this._path = [];
        this._hasPath = false;
        this._fillColor = null;
    }

    lineStyle(width, color, alpha = 1, _alignment, _native, cap) {
        this._strokeCurrentPath();
        this._fillCurrentPath();
        this._lineWidth = width;
        this._lineColor = color ?? 0xffffff;
        this._lineAlpha = alpha ?? 1;
        this._lineCap = cap === LINE_CAP.BUTT ? 'butt' : 'round';
    }

    beginFill(color, alpha = 1) {
        this._strokeCurrentPath();
        this._fillColor = color;
        this._fillAlpha = alpha ?? 1;
    }

    endFill() {
        this._fillCurrentPath();
    }

    moveTo(x, y) {
        this._path.push({ t: 'M', x, y });
        this._hasPath = true;
    }

    lineTo(x, y) {
        this._path.push({ t: 'L', x, y });
        this._hasPath = true;
    }

    quadraticCurveTo(cpx, cpy, x, y) {
        this._path.push({ t: 'Q', cpx, cpy, x, y });
        this._hasPath = true;
    }

    closePath() {
        if (this._hasPath) this._path.push({ t: 'Z' });
    }

    drawCircle(x, y, radius) {
        if (this._fillColor !== null) {
            this.commands.push({
                type: 'fillCircle',
                x,
                y,
                radius,
                color: this._fillColor,
                alpha: this._fillAlpha,
            });
        } else if (this._lineWidth > 0) {
            this.commands.push({
                type: 'strokeCircle',
                x,
                y,
                radius,
                ...this._lineState(),
            });
        }
    }

    drawRect(x, y, w, h) {
        if (this._fillColor !== null) {
            this.commands.push({
                type: 'fillRect',
                x,
                y,
                w,
                h,
                color: this._fillColor,
                alpha: this._fillAlpha,
            });
        } else if (this._lineWidth > 0) {
            this.commands.push({
                type: 'strokeRect',
                x,
                y,
                w,
                h,
                ...this._lineState(),
            });
        }
    }

    drawRoundedRect(x, y, w, h, radius) {
        if (this._fillColor !== null) {
            this.commands.push({
                type: 'fillRoundedRect',
                x,
                y,
                w,
                h,
                radius,
                color: this._fillColor,
                alpha: this._fillAlpha,
            });
        } else if (this._lineWidth > 0) {
            this.commands.push({
                type: 'strokeRoundedRect',
                x,
                y,
                w,
                h,
                radius,
                ...this._lineState(),
            });
        }
    }

    drawEllipse(x, y, rx, ry) {
        if (this._fillColor !== null) {
            this.commands.push({
                type: 'fillEllipse',
                x,
                y,
                rx,
                ry,
                color: this._fillColor,
                alpha: this._fillAlpha,
            });
        } else if (this._lineWidth > 0) {
            this.commands.push({
                type: 'strokeEllipse',
                x,
                y,
                rx,
                ry,
                ...this._lineState(),
            });
        }
    }

    drawPolygon(points) {
        if (!points?.length) return;
        const path = [];
        if (typeof points[0] === 'number') {
            path.push({ t: 'M', x: points[0], y: points[1] });
            for (let i = 2; i < points.length; i += 2) {
                path.push({ t: 'L', x: points[i], y: points[i + 1] });
            }
        } else {
            path.push({ t: 'M', x: points[0].x, y: points[0].y });
            for (let i = 1; i < points.length; i++) {
                path.push({ t: 'L', x: points[i].x, y: points[i].y });
            }
        }
        path.push({ t: 'Z' });
        if (this._fillColor !== null) {
            this.commands.push({
                type: 'fillPath',
                path,
                color: this._fillColor,
                alpha: this._fillAlpha,
            });
        } else if (this._lineWidth > 0) {
            this.commands.push({
                type: 'strokePath',
                path,
                ...this._lineState(),
            });
        }
    }

    _applyPath(ctx, path) {
        for (const seg of path) {
            if (seg.t === 'M') ctx.moveTo(seg.x, seg.y);
            else if (seg.t === 'L') ctx.lineTo(seg.x, seg.y);
            else if (seg.t === 'Q') ctx.quadraticCurveTo(seg.cpx, seg.cpy, seg.x, seg.y);
            else if (seg.t === 'Z') ctx.closePath();
        }
    }

    _applyLineStyle(ctx, cmd) {
        ctx.lineWidth = cmd.width;
        ctx.lineCap = cmd.cap || 'round';
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeStyle = hexToRgba(cmd.color, cmd.alpha);
    }

    _executeCommand(ctx, cmd) {
        switch (cmd.type) {
            case 'strokePath': {
                ctx.beginPath();
                this._applyPath(ctx, cmd.path);
                this._applyLineStyle(ctx, cmd);
                ctx.stroke();
                break;
            }
            case 'fillPath': {
                ctx.beginPath();
                this._applyPath(ctx, cmd.path);
                ctx.fillStyle = hexToRgba(cmd.color, cmd.alpha);
                ctx.fill();
                break;
            }
            case 'fillRect': {
                ctx.fillStyle = hexToRgba(cmd.color, cmd.alpha);
                ctx.fillRect(cmd.x, cmd.y, cmd.w, cmd.h);
                break;
            }
            case 'strokeRect': {
                ctx.beginPath();
                ctx.rect(cmd.x, cmd.y, cmd.w, cmd.h);
                this._applyLineStyle(ctx, cmd);
                ctx.stroke();
                break;
            }
            case 'fillCircle': {
                ctx.beginPath();
                ctx.arc(cmd.x, cmd.y, cmd.radius, 0, Math.PI * 2);
                ctx.fillStyle = hexToRgba(cmd.color, cmd.alpha);
                ctx.fill();
                break;
            }
            case 'strokeCircle': {
                ctx.beginPath();
                ctx.arc(cmd.x, cmd.y, cmd.radius, 0, Math.PI * 2);
                this._applyLineStyle(ctx, cmd);
                ctx.stroke();
                break;
            }
            case 'fillRoundedRect': {
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(cmd.x, cmd.y, cmd.w, cmd.h, cmd.radius);
                } else {
                    const r = Math.min(cmd.radius, cmd.w / 2, cmd.h / 2);
                    const { x, y, w, h } = cmd;
                    ctx.moveTo(x + r, y);
                    ctx.lineTo(x + w - r, y);
                    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                    ctx.lineTo(x + w, y + h - r);
                    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                    ctx.lineTo(x + r, y + h);
                    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                    ctx.lineTo(x, y + r);
                    ctx.quadraticCurveTo(x, y, x + r, y);
                    ctx.closePath();
                }
                ctx.fillStyle = hexToRgba(cmd.color, cmd.alpha);
                ctx.fill();
                break;
            }
            case 'strokeRoundedRect': {
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(cmd.x, cmd.y, cmd.w, cmd.h, cmd.radius);
                } else {
                    const r = Math.min(cmd.radius, cmd.w / 2, cmd.h / 2);
                    const { x, y, w, h } = cmd;
                    ctx.moveTo(x + r, y);
                    ctx.lineTo(x + w - r, y);
                    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                    ctx.lineTo(x + w, y + h - r);
                    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                    ctx.lineTo(x + r, y + h);
                    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                    ctx.lineTo(x, y + r);
                    ctx.quadraticCurveTo(x, y, x + r, y);
                    ctx.closePath();
                }
                this._applyLineStyle(ctx, cmd);
                ctx.stroke();
                break;
            }
            case 'fillEllipse': {
                ctx.beginPath();
                ctx.ellipse(cmd.x, cmd.y, cmd.rx, cmd.ry, 0, 0, Math.PI * 2);
                ctx.fillStyle = hexToRgba(cmd.color, cmd.alpha);
                ctx.fill();
                break;
            }
            case 'strokeEllipse': {
                ctx.beginPath();
                ctx.ellipse(cmd.x, cmd.y, cmd.rx, cmd.ry, 0, 0, Math.PI * 2);
                this._applyLineStyle(ctx, cmd);
                ctx.stroke();
                break;
            }
            default:
                break;
        }
    }

    render(ctx) {
        if (!this.visible || this.alpha <= 0) return;
        this._strokeCurrentPath();
        this._fillCurrentPath();
        if (!this.commands.length) return;

        ctx.save();
        ctx.globalAlpha *= this.alpha;
        ctx.translate(this.position.x, this.position.y);
        if (this.rotation) ctx.rotate(this.rotation);
        ctx.scale(this.scale.x, this.scale.y);
        if (this.blendMode === 'add') ctx.globalCompositeOperation = 'lighter';

        for (const cmd of this.commands) {
            this._executeCommand(ctx, cmd);
        }

        ctx.restore();
    }
}

/** Pixi Text → Canvas 2D fillText/strokeText. */
export class CanvasText extends DisplayObject {
    constructor(content = '', style = {}) {
        super();
        this.text = content;
        this.style = style;
        this.anchor = makeVec2();
    }

    render(ctx) {
        if (!this.visible || this.alpha <= 0 || !this.text) return;

        const fontSize = this.style.fontSize ?? 16;
        const fontFamily = this.style.fontFamily ?? 'sans-serif';
        const fontWeight = this.style.fontWeight ?? 'normal';
        const fill = this.style.fill ?? 0xffffff;
        const stroke = this.style.stroke ?? 0x000000;
        const strokeThickness = this.style.strokeThickness ?? 0;

        ctx.save();
        ctx.globalAlpha *= this.alpha;
        ctx.translate(this.position.x, this.position.y);
        if (this.rotation) ctx.rotate(this.rotation);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(this.text);
        const textW = metrics.width;
        const textH = fontSize;
        ctx.translate(-this.anchor.x * textW, -this.anchor.y * textH);

        if (strokeThickness > 0) {
            ctx.lineWidth = strokeThickness;
            ctx.strokeStyle = hexToRgba(stroke, 1);
            ctx.lineJoin = 'round';
            ctx.strokeText(this.text, 0, 0);
        }
        ctx.fillStyle = hexToRgba(fill, 1);
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
}

/** Pixi Application → canvas element + rAF game loop. */
export class CanvasApp {
    constructor(options = {}) {
        this.backgroundColor = options.backgroundColor ?? 0x2c2c2c;
        this.antialias = options.antialias !== false;
        this.resolution = options.resolution ?? Math.min(window.devicePixelRatio || 1, 2);
        this.logicalWidth = 1;
        this.logicalHeight = 1;

        this.view = document.createElement('canvas');
        this.ctx = this.view.getContext('2d', { alpha: false });
        if (this.antialias) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }

        this.stage = new CanvasLayer();
        this.ticker = {
            deltaTime: 1,
            deltaMS: 16,
            _callbacks: [],
            add(fn) {
                this._callbacks.push(fn);
            },
        };

        this._lastTs = 0;
        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    }

    get renderer() {
        return {
            resolution: this.resolution,
            width: this.logicalWidth * this.resolution,
            height: this.logicalHeight * this.resolution,
            resize: (w, h) => this.resize(w, h),
        };
    }

    resize(logicalW, logicalH) {
        this.logicalWidth = logicalW;
        this.logicalHeight = logicalH;
        const dpr = this.resolution;
        this.view.width = Math.round(logicalW * dpr);
        this.view.height = Math.round(logicalH * dpr);
        this.view.style.width = `${logicalW}px`;
        this.view.style.height = `${logicalH}px`;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    clear() {
        this.ctx.fillStyle = hexToRgba(this.backgroundColor, 1);
        this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    }

    render() {
        this.clear();
        this.stage.render(this.ctx);
    }

    _loop(ts) {
        const deltaMS = this._lastTs ? ts - this._lastTs : 16;
        this._lastTs = ts;
        this.ticker.deltaMS = deltaMS;
        this.ticker.deltaTime = deltaMS / (1000 / 60);

        for (const fn of this.ticker._callbacks) {
            try {
                fn();
            } catch (e) {
                console.error('Error in ticker:', e);
            }
        }

        this.render();
        requestAnimationFrame(this._loop);
    }
}

// Pixi-compatible aliases for minimal ui.js churn
export const Graphics = CanvasGraphics;
export const Container = CanvasLayer;
export const Text = CanvasText;
export const Application = CanvasApp;
