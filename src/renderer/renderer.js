import PianorollGrid from './pianoroll-grid';
import CircleGraph from './circle-graph';
import ChordGraph from './chord-graph';
import { Noise } from 'noisejs';
import { lerp } from './../utils/utils';

export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.matrix = [];
    this.chords = [];
    this.currentChord = '';
    this.displayWidth = 0;
    this.displayHeight = 0;
    this.fontSize = 0.8;
    this.fontSizeBase = 0.8;
    this.beat = 0;
    this.sectionIndex = 0;
    this.barIndex = 0;

    this.frameCount = 0;
    this.halt = false;

    this.backgroundColor = 'rgba(37, 38, 35, 1.0)';
    this.noteOnColor = 'rgba(255, 255, 255, 1.0)';
    this.mouseOnColor = 'rgba(150, 150, 150, 1.0)';
    this.noteOnCurrentColor = 'rgba(255, 100, 100, 1.0)';
    this.boxColor = 'rgba(200, 200, 200, 1.0)';
    this.extendAlpha = 0;
    this.currentUpdateDir = 0;
    this.selectedLatent = 20;

    this.pianorollGrid = new PianorollGrid(this, -1.0);


    // graphs
    this.latents = [[], [], []];
    this.latentGraphs = [];
    this.noise = new Noise(Math.random());

    // interpolation display
    this.h_step = 0;

    this.initMatrix();
    this.initGraph();
  }

  initMatrix() {
    for (let i = 0; i < 96; i += 1) {
      this.matrix[i] = [];
      for (let t = 0; t < 9; t += 1) {
        this.matrix[i][t] = -1;
      }
    }
  }

  initGraph() {
    // this.chordGraph = new ChordGraph(
    //   this, 0.3, 0.33, 1.5, -0.50, 0.8);
    // this.circleGraph = new CircleGraph(
    //   this, 0.4, 0.99, 1.5, 0.16, 0.8);
    this.chordGraph = new ChordGraph(
      this, 0.45, 0.66, 1.5, -0.33, 0.8);
    this.circleGraph = new CircleGraph(
      this, 0.4, 0.66, 1.5, 0.33, 0.8);
  }

  randomMatrix() {
    for (let i = 0; i < 96; i += 1) {
      for (let t = 0; t < 9; t += 1) {
        this.matrix[i][t] = (Math.random() > 0.9 ? 1 : 0);
      }
    }
  }

  changeMatrix(mat) {
    this.halt = false;
    this.matrix = mat;
  }

  draw(scr, sectionIndex = 0, barIndex = 0, b = 0) {

    if (this.halt) {
      if (this.frameCount % 5 == 0) {
        this.randomMatrix();
      }
    }
    this.frameCount += 1;
    this.beat = b;
    this.barIndex = barIndex;
    this.sectionIndex = sectionIndex;
    const ctx = this.canvas.getContext('2d');
    ctx.font = '0.8rem monospace';
    this.width = scr.width;
    this.height = scr.height;
    const width = scr.width;
    const height = scr.height;

    ctx.save();
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const h = Math.min(width, height) * 0.25;
    const w = width * 0.5;
    this.displayWidth = w;
    this.displayHeight = h;
    this.fontSizeBase = Math.pow(w / 1000, 0.4);
    this.setFontSize(ctx, Math.pow(w / 1000, 0.4));

    ctx.translate(width * 0.5, height * 0.5 - 15);

    this.pianorollGrid.draw(ctx, w * 1.2, h * 1.0);

    // this.drawInterpolation(ctx, w * 0.1, h);
    this.drawLatents(ctx);
    ctx.restore();
  }

  drawInterpolation(ctx, w, h) {
    ctx.save();
    ctx.translate(-(this.displayWidth) * 0.5, 0);
    this.drawFrame(ctx, w * 1.1, h * 1.1);
    const h_step = (h / 8);
    this.h_step = h_step;

    // start drawing
    ctx.translate(-w * 0.2, 0);
    for (let i = 0; i < 8; i += 1) {
      ctx.save();
      const j = i - (8 / 2);
      ctx.translate(0, h_step * (j + 0.25));
      ctx.fillStyle = '#555';
      if (i === this.barIndex) {
        ctx.fillStyle = '#F00';
      }
      ctx.fillRect(0, 0, w * 0.2, h_step * 0.5);
      ctx.restore();
    }
    ctx.restore();
  }

  handleInterpolationClick(x, y) {
    const xpos = x + (this.displayWidth * 0.5);
    const ypos = y;
    // console.log(`x: ${xpos}, y: ${ypos}`);
    if (Math.abs(xpos) < this.displayWidth * 0.1) {
      const index = Math.floor(ypos / this.h_step + 0.5) +
        Math.floor(this.matrix.length / 2);
      if (index >= 0 && index < this.matrix.length) {
        console.log(`click index: [${index}]`);
        this.sectionIndex = index;
        return true;
      }
      return false;
    }
    return false;
  }

  handleMouseDownOnPianoroll(x, y) {
    return false;
  }

  handleMouseDown(e) {
    let cx = e.clientX - this.width * 0.5;;
    let cy = e.clientY - this.height * 0.5;

    return [
      this.handleInterpolationClick(cx, cy),
      this.handleMouseDownOnPianoroll(cx, cy),
    ];
  }

  handleMouseMoveOnGraph(e) {
    const { graphX, graphY, graphRadius, graphRadiusRatio } = this.latentGraph;
    const r = Math.pow(this.displayHeight, 2);
    let x = e.clientX - this.width * 0.5;
    let y = e.clientY - this.height * 0.5;
    let d1 = Math.pow(x - graphX, 2) + Math.pow(y - graphY, 2);
    if (d1 < r * 1.2 & d1 > r * 0.1) {
      const d = Math.sqrt(d1);
      const range = 0.1;
      const radius = range * graphRadiusRatio * this.displayHeight + graphRadius;
      const v = lerp(d, graphRadius, radius, 0, range);
      this.latent[this.selectedLatent] = v;
    }
  }

  handleMouseMove(e) {
    const x = e.clientX - (this.width * 0.5);
    const y = e.clientY - (this.height * 0.5);
  }

  setFontSize(ctx, amt) {
    this.fontSize = amt;
    ctx.font = this.fontSize.toString() + 'rem monospace';
  }


  // draw frame
  drawFrame(ctx, w, h) {
    const unit = this.displayHeight * 0.02;

    ctx.save();

    ctx.strokeStyle = '#FFF';

    ctx.beginPath()
    ctx.moveTo(0.5 * w, 0.5 * h - unit);
    ctx.lineTo(0.5 * w, 0.5 * h);
    ctx.lineTo(0.5 * w - unit, 0.5 * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(-0.5 * w, 0.5 * h - unit);
    ctx.lineTo(-0.5 * w, 0.5 * h);
    ctx.lineTo(-0.5 * w + unit, 0.5 * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(0.5 * w, -0.5 * h + unit);
    ctx.lineTo(0.5 * w, -0.5 * h);
    ctx.lineTo(0.5 * w - unit, -0.5 * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(-0.5 * w, -0.5 * h + unit);
    ctx.lineTo(-0.5 * w, -0.5 * h);
    ctx.lineTo(-0.5 * w + unit, -0.5 * h);
    ctx.stroke();

    ctx.restore();
  }


  // graphs
  drawLatents(ctx) {
    for (let j = 0; j < 12; j += 1) {
      const i = 0;
      const value = this.noise.perlin2(i * 2 + j * 0.1, this.frameCount * 0.005);
      this.latents[0][j] = lerp(value, 0, 1, -0.01, 0.01);
    }
    this.circleGraph.draw(ctx, this.displayHeight);
    this.chordGraph.draw(ctx, this.displayHeight);
  }

}
