import { IShape, ShapeOptions } from './types';
import { Circle } from './shapes/Circle';
import { Rectangle } from './shapes/Rectangle';
import { Triangle } from './shapes/Triangle';


export class ShapeFactory {
static create(opts: ShapeOptions): IShape {
switch (opts.kind) {
case 'circle':
return new Circle(opts);
case 'rectangle':
return new Rectangle(opts);
case 'triangle':
return new Triangle(opts);
default: {
const _exhaustive: never = opts;
throw new Error('Unsupported shape options: ' + _exhaustive);
}
}
}
}