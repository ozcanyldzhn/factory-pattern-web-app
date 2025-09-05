export type ShapeKind = 'circle' | 'rectangle' | 'triangle';


export interface ShapeOptionsBase {
x: number; // centerX for circle, top-left X for rect, apex X for triangle
y: number; // centerY for circle, top-left Y for rect, apex Y for triangle
fill: string;
stroke: string;
strokeWidth: number;
}


export interface CircleOptions extends ShapeOptionsBase {
kind: 'circle';
radius: number;
}


export interface RectangleOptions extends ShapeOptionsBase {
kind: 'rectangle';
width: number;
height: number;
rx?: number; // corner radius
ry?: number; // corner radius
}


export interface TriangleOptions extends ShapeOptionsBase {
kind: 'triangle';
size: number; // equilateral side length
}


export type ShapeOptions = CircleOptions | RectangleOptions | TriangleOptions;


export interface IShape {
kind: ShapeKind;
toSVG(): SVGElement; // Client-side DOM element
toSVGString(): string; // Server-side string rendering
}

export interface SvgCanvasOptions {
width: number;
height: number;
background?: string;
}

export interface RenderRequest {
shapes: ShapeOptions[];
canvas: SvgCanvasOptions;
}