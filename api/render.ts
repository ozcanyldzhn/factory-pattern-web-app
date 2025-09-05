import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ShapeService } from '../src/services/ShapeService';
import { RenderRequest } from '../src/shared/types';

// Enable CORS
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const requestBody = req.body as RenderRequest;
    
    // Validate request
    if (!requestBody || !requestBody.shapes || !requestBody.canvas) {
      return res.status(400).json({ 
        error: 'Invalid request body. Expected: { shapes: ShapeOptions[], canvas: SvgCanvasOptions }' 
      });
    }
    
    const shapeService = new ShapeService();
    const svg = shapeService.renderShapes(requestBody);
    
    // Set SVG content type
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    return res.status(200).send(svg);
    
  } catch (error) {
    console.error('Shape rendering error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(400).json({ error: message });
  }
}
