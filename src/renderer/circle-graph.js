import chordsDictionary from './../music/chords-dictionary';

export default class CircleGraph {

  constructor(renderer, rr = 0.6, wr = 0.5, hr = 1.5, xsr = -0.25, ysr = 0.6) {
    this.renderer = renderer;
    this.positions = new Array(12).fill(0.01);
    this.dims = 12;
    this.graphX = 0;
    this.graphY = 0;
    this.graphRadius = 0;
    this.graphWidth = 0;
    this.graphHeight = 0;
    this.graphRadiusRatio = 10;
    this.currentChord = '';

    this.radiusRatio = rr;
    this.widthRatio = wr;
    this.heightRatio = hr;
    this.xShiftRatio = xsr;
    this.yShiftRatio = ysr;

    this.showDashCircle = false;
    this.showText = false;
    this.showDiagram = false;
    this.showIndication = true;
    this.dashAmounts = 25;

    this.initAnimation();
    this.initChords();
  }

  initAnimation() {
    this.chordTextShift = 0;
    this.angleShift = 0;

    this.chordPositionX = 0;
    this.chordPositionY = 0;
    this.chordPositionXDest = 0;
    this.chordPositionYDest = 0;
    this.chordPositionUpdateRatio = 0.08;
  }

  initChords() {
    // 0. Dominant
    // 1. Others
    // 2. Tonal
    this.fifths = [
      [
        'CM',
        'GM',
        'DM',
        'AM',
        'EM',
        'BM',
        'GbM',
        'DbM',
        'AbM',
        'EbM',
        'BbM',
        'FM',
      ],
      [
        'Am',
        'Em',
        'Bm',
        'Gbm',
        'Dbm',
        'Abm',
        'Ebm',
        'Bbm',
        'Fm',
        'Cm',
        'Gm',
        'Dm',
      ],
    ];

    this.DOMINANT = 0;
    this.OTHERS = 1;
    this.TONAL = 2;
    this.NONE = 3;
  }

  update() {
    const { displayHeight, displayWidth, currentChord } = this.renderer;
    this.graphRadius = displayHeight * this.radiusRatio;
    this.graphWidth = displayWidth * this.widthRatio;
    this.graphHeight = displayHeight * this.heightRatio;
    this.graphY = displayHeight * this.yShiftRatio;
    this.graphX = displayWidth * this.xShiftRatio;

    if (this.currentChord !== currentChord) {
      this.currentChord = currentChord;
      this.chordTextShift = 10;

      if (currentChord === 'x') {
        this.chordPositionXDest = 0;
        this.chordPositionYDest = 0;
      }

    }

    this.updateAnimation();
  }

  draw(ctx) {
    this.update();

    ctx.save();
    ctx.translate(this.graphX, this.graphY);
    this.renderer.drawFrame(ctx, this.graphWidth, this.graphHeight);

    if (this.showDashCircle) {
      this.drawDashCircle(ctx);
    }

    this.drawPoints(ctx);

    if (this.showIndication) {
      this.drawIndication(ctx, this.graphWidth, this.graphHeight);
    }

    ctx.restore();
  }

  drawPoints(ctx) {
    ctx.save();

    const { frameCount, fontSize, fontSizeBase } = this.renderer;
    const dims = this.dims;
    const unit = this.renderer.displayHeight;
    const angle = 2 * Math.PI / dims;
    // const angleShift = Math.PI / 6 + (Math.PI * 0.02) * Math.sin(frameCount * 0.03);
    const angleShift = 0;

    let xPrev;
    let yPrev;
    let xFirst;
    let yFirst;

    ctx.rotate(angleShift);
    for (let layer = 0; layer < 2; layer += 1) {
      for (let i = 0; i < dims; i += 1) {
        const value = this.positions[i] * (layer === 0 ? 1 : -1);
        ctx.save();
        const radius = value * this.graphRadiusRatio * unit + this.graphRadius;

        const x = radius * Math.cos(angle * i);
        const y = radius * Math.sin(angle * i);

        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(xPrev, yPrev);
          ctx.lineTo(x, y);
          ctx.strokeStyle = '#999';
          ctx.stroke();
        } else {
          xFirst = x;
          yFirst = y;
        }
        if (i === this.dims - 1) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(xFirst, yFirst);
          ctx.strokeStyle = '#999';
          ctx.stroke();
        }
        xPrev = x;
        yPrev = y;

        // ctx.translate(x, y);

        // const c = this.fifths[layer][i];
        // if (c === this.currentChord) {
        //   this.chordPositionXDest = x;
        //   this.chordPositionYDest = y;
        // }

        // ctx.beginPath();
        // ctx.arc(
        //   0,
        //   0,
        //   this.graphRadius * (c === this.currentChord ? 0.12 : 0.03),
        //   0,
        //   Math.PI * 2,
        //   true
        // );

        // ctx.fillStyle = '#999';
        // ctx.fill();

        // // texts
        // ctx.save();
        // // ctx.translate(x * (layer === 0 ? 0.16 : -0.25), y * (layer === 0 ? 0.16 : -0.25));
        // // ctx.translate(0, fontSize * (layer === 0 ? 0.25 : 0.2));
        // ctx.translate(0, fontSize * (layer === 0 ? 2.0 : 5.0));
        // ctx.fillStyle = '#FFF';
        // if (c === this.currentChord) {
        //   ctx.fillStyle = '#F00';
        // } else {
        //   ctx.translate(x * (layer === 0 ? 0.16 : 0.25), y * (layer === 0 ? 0.16 : 0.25));
        // }
        // ctx.textAlign = 'center';
        // ctx.fillText(this.fifths[layer][i], 0, 0);
        // ctx.restore();

        ctx.restore();
      }
    }

    for (let layer = 0; layer < 2; layer += 1) {
      for (let i = 0; i < dims; i += 1) {
        const value = this.positions[i] * (layer === 0 ? 1 : -1);
        ctx.save();
        const radius = value * this.graphRadiusRatio * unit + this.graphRadius;

        const x = radius * Math.cos(angle * i);
        const y = radius * Math.sin(angle * i);
        const c = this.fifths[layer][i];
        if (c === this.currentChord) {
          this.chordPositionXDest = x;
          this.chordPositionYDest = y;
        }

        ctx.translate(x, y);

        ctx.beginPath();
        ctx.arc(
          0,
          0,
          this.graphRadius * (c === this.currentChord ? 0.12 : 0.03),
          0,
          Math.PI * 2,
          true
        );

        ctx.fillStyle = '#FFF';
        ctx.fill();

        // texts
        ctx.save();
        // ctx.translate(x * (layer === 0 ? 0.16 : -0.25), y * (layer === 0 ? 0.16 : -0.25));
        // ctx.translate(0, fontSize * (layer === 0 ? 0.25 : 0.2));
        ctx.translate(0, fontSizeBase * (layer === 0 ? 2.0 : 5.0));
        ctx.fillStyle = '#FFF';
        if (c === this.currentChord) {
          this.renderer.setFontSize(ctx, fontSizeBase * 0.8);
          ctx.fillStyle = '#000';
        } else {
          ctx.translate(x * (layer === 0 ? 0.16 : 0.25), y * (layer === 0 ? 0.16 : 0.25));
        }
        ctx.textAlign = 'center';
        ctx.fillText(this.fifths[layer][i], 0, 0);
        ctx.restore();

        ctx.restore();
      }
    }
    this.drawCurrentChord(ctx);

    ctx.restore();
  }

  drawCurrentChord(ctx) {
    const { frameCount } = this.renderer;
    ctx.save();
    ctx.translate(this.chordPositionX, this.chordPositionY);
    ctx.strokeStyle = '#F00';
    const r = this.graphRadius * (0.25 + 0.03 * Math.sin(frameCount * 0.1));

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2, true);
    ctx.stroke();

    ctx.restore();
  }

  drawDashCircle(ctx) {
    const a = 2 * (Math.PI / this.dashAmounts);
    for (let i = 0; i < this.dashAmounts; i += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, this.graphRadius, i * a, i * a + 0.1);
      ctx.strokeStyle = '#888';
      ctx.stroke();
    }
  }

  // draw diagram
  drawDiagram(ctx, w, h) {
    const unit = h / 6;
    const length = 15;
    const width = 3;

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.translate(-0.5 * w, -0.5 * h);
    ctx.translate(1.0 * unit, 0.5 * unit);

    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(0, 0, length * this.graphWidth * Math.abs(this.latent[i]), width);
      ctx.translate(0, unit);
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#888';
    ctx.translate(0.5 * w, -0.5 * h);
    ctx.translate(-1.0 * unit, 0.5 * unit);

    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(0, 0, -length * this.graphWidth * Math.abs(this.latent[i + 6]), width);
      ctx.translate(0, unit);
    }
    ctx.restore();
  }

  drawIndication(ctx, w, h) {
    const width = 5;

    if (!this.fetching) {
      if (this.renderer.frameCount % 20 < 10) {
        ctx.save();
        ctx.fillStyle = '#F00';
        ctx.translate(-0.5 * w, -0.5 * h);
        ctx.translate(15, 15);

        ctx.beginPath();
        ctx.arc(0, 0, width, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.fillStyle = '#0F0';
      ctx.translate(-0.5 * w, -0.5 * h);
      ctx.translate(15, 15);

      ctx.beginPath();
      ctx.arc(0, 0, width, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // animations
  updateAnimation() {
    this.chordPositionX += (this.chordPositionXDest - this.chordPositionX) * this.chordPositionUpdateRatio;
    this.chordPositionY += (this.chordPositionYDest - this.chordPositionY) * this.chordPositionUpdateRatio;

    this.chordTextShift += (0 - this.chordTextShift) * 0.05;
  }

}
