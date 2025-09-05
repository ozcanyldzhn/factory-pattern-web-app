import { ShapeFactory } from '../shared/ShapeFactory';
import {
  ShapeOptions,
  CircleOptions,
  RectangleOptions,
  TriangleOptions,
  SvgCanvasOptions,
} from '../shared/types';
import { ApiService } from './apiService';

const stage = document.getElementById('stage') as SVGSVGElement;
const shapeList = document.getElementById('shapeList') as HTMLUListElement;
const svgContainer = document.getElementById('svgContainer') as HTMLDivElement;

const kindEl = document.getElementById('shapeKind') as HTMLSelectElement;
const xEl = document.getElementById('x') as HTMLInputElement;
const yEl = document.getElementById('y') as HTMLInputElement;
const fillEl = document.getElementById('fill') as HTMLInputElement;
const strokeEl = document.getElementById('stroke') as HTMLInputElement;
const strokeWidthEl = document.getElementById('strokeWidth') as HTMLInputElement;
const sizeFields = document.getElementById('sizeFields') as HTMLDivElement;

const addBtn = document.getElementById('addBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;

// Zoom ve pan kontrolleri
const zoomInBtn = document.getElementById('zoomIn') as HTMLButtonElement;
const zoomOutBtn = document.getElementById('zoomOut') as HTMLButtonElement;
const resetViewBtn = document.getElementById('resetView') as HTMLButtonElement;
const fitShapesBtn = document.getElementById('fitShapes') as HTMLButtonElement;
const zoomLevelEl = document.getElementById('zoomLevel') as HTMLSpanElement;

const apiService = new ApiService();
const shapes: ShapeOptions[] = [];
let counter = 0;

// Zoom ve pan state
let currentZoom = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let lastPanPoint = { x: 0, y: 0 };

// Transform uygula
function applyTransform() {
  stage.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
  zoomLevelEl.textContent = `${Math.round(currentZoom * 100)}%`;
}

// Zoom fonksiyonları
function updateZoom(newZoom: number, centerX?: number, centerY?: number) {
  const oldZoom = currentZoom;
  currentZoom = Math.max(0.1, Math.min(5, newZoom));
  
  // Eğer merkez noktası verilmişse, o noktayı sabit tutarak zoom yap
  if (centerX !== undefined && centerY !== undefined) {
    const zoomRatio = currentZoom / oldZoom;
    panX = centerX - (centerX - panX) * zoomRatio;
    panY = centerY - (centerY - panY) * zoomRatio;
  }
  
  applyTransform();
}

// Şekillerin merkezini bul
function getShapesCenter() {
  const bounds = getShapesBounds();
  if (!bounds) {
    // Eğer şekil yoksa container'ın merkezini döndür
    return {
      x: svgContainer.clientWidth / 2,
      y: svgContainer.clientHeight / 2
    };
  }
  
  // Şekillerin merkez noktasını hesapla (screen koordinatlarında)
  const shapeCenterX = (bounds.minX + bounds.maxX) / 2;
  const shapeCenterY = (bounds.minY + bounds.maxY) / 2;
  
  // Screen koordinatlarına çevir
  const screenX = shapeCenterX * currentZoom + panX;
  const screenY = shapeCenterY * currentZoom + panY;
  
  return { x: screenX, y: screenY };
}

function zoomIn() {
  const center = getShapesCenter();
  updateZoom(currentZoom * 1.2, center.x, center.y);
}

function zoomOut() {
  const center = getShapesCenter();
  updateZoom(currentZoom / 1.2, center.x, center.y);
}

function resetView() {
  currentZoom = 1;
  panX = 0;
  panY = 0;
  applyTransform();
}

// Şekillerin bounding box'ını hesapla
function getShapesBounds() {
  if (shapes.length === 0) return null;
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  shapes.forEach(shape => {
    const { x, y } = shape;
    let width = 0, height = 0;
    
    if (shape.kind === 'circle') {
      const r = shape.radius;
      minX = Math.min(minX, x - r);
      maxX = Math.max(maxX, x + r);
      minY = Math.min(minY, y - r);
      maxY = Math.max(maxY, y + r);
    } else if (shape.kind === 'rectangle') {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + shape.width);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + shape.height);
    } else if (shape.kind === 'triangle') {
      const size = shape.size;
      const h = (Math.sqrt(3) / 2) * size;
      minX = Math.min(minX, x - size / 2);
      maxX = Math.max(maxX, x + size / 2);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + h);
    }
  });
  
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

// Tüm şekilleri göster
function fitAllShapes() {
  const bounds = getShapesBounds();
  if (!bounds) return;
  
  const containerWidth = svgContainer.clientWidth;
  const containerHeight = svgContainer.clientHeight;
  
  // Padding ekle
  const padding = 50;
  const scaleX = (containerWidth - padding * 2) / bounds.width;
  const scaleY = (containerHeight - padding * 2) / bounds.height;
  const scale = Math.min(scaleX, scaleY, 2); // Max 2x zoom
  
  currentZoom = scale;
  panX = -bounds.minX * scale + padding;
  panY = -bounds.minY * scale + padding;
  
  applyTransform();
}

function renderSizeFields() {
  const kind = kindEl.value as 'circle' | 'rectangle' | 'triangle';
  if (kind === 'circle') {
    sizeFields.innerHTML = `
      <div>
        <label class="block text-sm">Yarıçap</label>
        <input id="radius" type="number" value="50" class="w-full border rounded-xl px-3 py-2" />
      </div>`;
  } else if (kind === 'rectangle') {
    sizeFields.innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm">Genişlik</label>
          <input id="width" type="number" value="140" class="w-full border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm">Yükseklik</label>
          <input id="height" type="number" value="90" class="w-full border rounded-xl px-3 py-2" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm">Köşe (rx)</label>
          <input id="rx" type="number" value="12" class="w-full border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm">Köşe (ry)</label>
          <input id="ry" type="number" value="12" class="w-full border rounded-xl px-3 py-2" />
        </div>
      </div>`;
  } else {
    sizeFields.innerHTML = `
      <div>
        <label class="block text-sm">Kenar Uzunluğu</label>
        <input id="size" type="number" value="120" class="w-full border rounded-xl px-3 py-2" />
      </div>`;
  }
}

function buildOptions(): ShapeOptions {
  const common = {
    x: Number(xEl.value),
    y: Number(yEl.value),
    fill: fillEl.value,
    stroke: strokeEl.value,
    strokeWidth: Number(strokeWidthEl.value),
  } as const;

  const kind = kindEl.value as 'circle' | 'rectangle' | 'triangle';
  if (kind === 'circle') {
    const radius = Number((document.getElementById('radius') as HTMLInputElement).value);
    return { kind, radius, ...common } as CircleOptions;
  }
  if (kind === 'rectangle') {
    const width = Number((document.getElementById('width') as HTMLInputElement).value);
    const height = Number((document.getElementById('height') as HTMLInputElement).value);
    const rx = Number((document.getElementById('rx') as HTMLInputElement).value);
    const ry = Number((document.getElementById('ry') as HTMLInputElement).value);
    return { kind, width, height, rx, ry, ...common } as RectangleOptions;
  }
  const size = Number((document.getElementById('size') as HTMLInputElement).value);
  return { kind, size, ...common } as TriangleOptions;
}

function addListItem(kind: string) {
  // Dinamik ID: Mevcut şekil sayısına göre numara ver
  const currentShapeCount = shapeList.children.length + 1;
  
  const li = document.createElement('li');
  li.className = 'flex items-center justify-between rounded-xl border p-2';
  li.innerHTML = `
    <span class="text-slate-700">#${currentShapeCount} • ${kind}</span>
    <button class="text-primary hover:underline">Kaldır</button>
  `;
  
  const btn = li.querySelector('button')!;
  const element = stage.lastElementChild!; // just appended
  
  btn.addEventListener('click', () => {
    // Şekli shapes array'den de kaldır
    const index = Array.from(shapeList.children).indexOf(li);
    if (index > -1) {
      shapes.splice(index, 1);
    }
    
    element.remove();
    li.remove();
    
    // Liste numaralarını yeniden düzenle
    updateListNumbers();
  });
  
  shapeList.appendChild(li);
}

function updateListNumbers() {
  Array.from(shapeList.children).forEach((li, index) => {
    const span = li.querySelector('span');
    if (span) {
      const kindText = span.textContent?.split('•')[1] || '';
      span.textContent = `#${index + 1} •${kindText}`;
    }
  });
}

function downloadSVG() {
  const clone = stage.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const data = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'shapes.svg';
  a.click();
  URL.revokeObjectURL(url);
}

kindEl.addEventListener('change', renderSizeFields);
renderSizeFields();


addBtn.addEventListener('click', async () => {
  try {
    const opts = buildOptions();
    shapes.push(opts);
    
    // Local DOM rendering for immediate feedback
    const shape = ShapeFactory.create(opts);
    const el = shape.toSVG();
    stage.appendChild(el);
    addListItem(shape.kind);
    
    // Re-render from server (background update)
    await renderFromServer();
  } catch (error) {
    console.error('Failed to add shape:', error);
    alert('Şekil eklenemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
  }
});

clearBtn.addEventListener('click', () => {
  shapes.length = 0;
  
  // Sadece şekilleri sil, grid pattern'i koru
  const elementsToRemove = Array.from(stage.children).filter(child => 
    child.tagName !== 'defs' && !(child.tagName === 'rect' && child.getAttribute('fill') === 'url(#grid)')
  );
  
  elementsToRemove.forEach(element => element.remove());
  
  shapeList.innerHTML = '';
  // counter artık kullanılmıyor, dinamik ID sistemi var
});

downloadBtn.addEventListener('click', downloadSVG);

// Zoom ve pan event listeners
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);
resetViewBtn.addEventListener('click', resetView);
fitShapesBtn.addEventListener('click', fitAllShapes);

// Mouse wheel zoom
svgContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  
  // Mouse pozisyonunu container'a göre hesapla
  const rect = svgContainer.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  updateZoom(currentZoom * zoomFactor, mouseX, mouseY);
});

// Drag to pan
svgContainer.addEventListener('mousedown', (e) => {
  if (e.button === 0) { // Sol tık
    isPanning = true;
    lastPanPoint = { x: e.clientX, y: e.clientY };
    svgContainer.style.cursor = 'grabbing';
    e.preventDefault();
  }
});

svgContainer.addEventListener('mousemove', (e) => {
  if (isPanning) {
    e.preventDefault();
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    panX += deltaX;
    panY += deltaY;
    
    lastPanPoint = { x: e.clientX, y: e.clientY };
    applyTransform();
  }
});

svgContainer.addEventListener('mouseup', () => {
  isPanning = false;
  svgContainer.style.cursor = 'grab';
});

svgContainer.addEventListener('mouseleave', () => {
  isPanning = false;
  svgContainer.style.cursor = 'grab';
});

async function renderFromServer() {
  try {
    if (shapes.length === 0) return;
    
    const canvas: SvgCanvasOptions = {
      width: 600,
      height: 400,
      background: '#f8fafc'
    };
    
    const svg = await apiService.renderSvg({ shapes, canvas });
    
    // Create a preview element to show server-rendered SVG
    const previewDiv = document.createElement('div');
    previewDiv.innerHTML = svg;
    previewDiv.className = 'server-preview';
    
    // Add to DOM temporarily for validation
    console.log('Server rendered SVG:', svg.substring(0, 200) + '...');
  } catch (error) {
    console.error('Server rendering failed:', error);
  }
}