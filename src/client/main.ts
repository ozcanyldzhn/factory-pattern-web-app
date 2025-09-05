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

const apiService = new ApiService();
const shapes: ShapeOptions[] = [];
let counter = 0;

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