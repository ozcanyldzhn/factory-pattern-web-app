import { IShape, TriangleOptions } from '../types';


export class Triangle implements IShape {
kind: 'triangle' = 'triangle';
constructor(private opts: TriangleOptions) {}


toSVG(): SVGPolygonElement {
const h = (Math.sqrt(3) / 2) * this.opts.size; // equilateral height
const x = this.opts.x;
const y = this.opts.y;
// Apex at (x, y), base horizontally below
const p1 = `${x},${y}`;
const p2 = `${x - this.opts.size / 2},${y + h}`;
const p3 = `${x + this.opts.size / 2},${y + h}`;

const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
el.setAttribute('points', `${p1} ${p2} ${p3}`);
el.setAttribute('fill', this.opts.fill);
el.setAttribute('stroke', this.opts.stroke);
el.setAttribute('stroke-width', String(this.opts.strokeWidth));
return el;
}

toSVGString(): string {
const h = (Math.sqrt(3) / 2) * this.opts.size;
const x = this.opts.x;
const y = this.opts.y;
const p1 = `${x},${y}`;
const p2 = `${x - this.opts.size / 2},${y + h}`;
const p3 = `${x + this.opts.size / 2},${y + h}`;
return `<polygon points="${p1} ${p2} ${p3}" fill="${this.opts.fill}" stroke="${this.opts.stroke}" stroke-width="${this.opts.strokeWidth}" />`;
}
}