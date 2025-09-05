import { ShapeFactory } from '../shared/ShapeFactory';
import { RenderRequest, SvgCanvasOptions, ShapeOptions } from '../shared/types';

export class ShapeService {
  renderShapes(request: RenderRequest): string {
    const { shapes, canvas } = request;
    
    // Validate input
    if (!Array.isArray(shapes)) {
      throw new Error('Shapes must be an array');
    }
    
    if (!canvas || typeof canvas.width !== 'number' || typeof canvas.height !== 'number') {
      throw new Error('Canvas must have valid width and height');
    }
    
    // Generate shape SVG strings
    const shapeElements = shapes.map(shapeOpts => {
      try {
        const shape = ShapeFactory.create(shapeOpts);
        return shape.toSVGString();
      } catch (error) {
        throw new Error(`Invalid shape: ${error.message}`);
      }
    });
    
    return this.wrapInSVG(shapeElements, canvas);
  }
  
  private wrapInSVG(elements: string[], canvas: SvgCanvasOptions): string {
    const backgroundRect = canvas.background 
      ? `  <rect x="0" y="0" width="100%" height="100%" fill="${canvas.background}" />\n`
      : '';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
${backgroundRect}${elements.map(el => `  ${el}`).join('\n')}
</svg>`;
  }
}
