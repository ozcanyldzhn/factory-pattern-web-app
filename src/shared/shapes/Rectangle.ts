import { IShape, RectangleOptions } from '../types';


export class Rectangle implements IShape {
kind: 'rectangle' = 'rectangle';
constructor(private opts: RectangleOptions) {}


toSVG(): SVGRectElement {
const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
el.setAttribute('x', String(this.opts.x));
el.setAttribute('y', String(this.opts.y));
el.setAttribute('width', String(this.opts.width));
el.setAttribute('height', String(this.opts.height));
if (this.opts.rx) el.setAttribute('rx', String(this.opts.rx));
if (this.opts.ry) el.setAttribute('ry', String(this.opts.ry));
el.setAttribute('fill', this.opts.fill);
el.setAttribute('stroke', this.opts.stroke);
el.setAttribute('stroke-width', String(this.opts.strokeWidth));
return el;
}

toSVGString(): string {
const rxAttr = this.opts.rx ? ` rx="${this.opts.rx}"` : '';
const ryAttr = this.opts.ry ? ` ry="${this.opts.ry}"` : '';
return `<rect x="${this.opts.x}" y="${this.opts.y}" width="${this.opts.width}" height="${this.opts.height}"${rxAttr}${ryAttr} fill="${this.opts.fill}" stroke="${this.opts.stroke}" stroke-width="${this.opts.strokeWidth}" />`;
}
}