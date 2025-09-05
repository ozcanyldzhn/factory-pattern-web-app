import { IShape, CircleOptions } from '../types';


export class Circle implements IShape {
kind: 'circle' = 'circle';
constructor(private opts: CircleOptions) {}


toSVG(): SVGCircleElement {
const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
el.setAttribute('cx', String(this.opts.x));
el.setAttribute('cy', String(this.opts.y));
el.setAttribute('r', String(this.opts.radius));
el.setAttribute('fill', this.opts.fill);
el.setAttribute('stroke', this.opts.stroke);
el.setAttribute('stroke-width', String(this.opts.strokeWidth));
return el;
}

toSVGString(): string {
return `<circle cx="${this.opts.x}" cy="${this.opts.y}" r="${this.opts.radius}" fill="${this.opts.fill}" stroke="${this.opts.stroke}" stroke-width="${this.opts.strokeWidth}" />`;
}
}