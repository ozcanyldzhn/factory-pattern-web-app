import { RenderRequest } from '../shared/types';

export class ApiService {
  private baseUrl: string;
  
  constructor() {
    // Vercel otomatik olarak doğru URL'yi kullanır
    this.baseUrl = window.location.origin;
  }
  
  async renderSvg(request: RenderRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('API render error:', error);
      throw error instanceof Error ? error : new Error('Failed to render SVG');
    }
  }
}
