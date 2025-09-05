# 🎨 Shape Factory (Full-Stack TypeScript)

Modern **Factory Pattern** implementasyonu ile SVG şekiller çizen full-stack web uygulaması.

## ✨ Özellikler

- 🏗️ **Factory Pattern**: Clean Architecture ile şekil oluşturma
- 🎯 **TypeScript**: Tip güvenli geliştirme
- 🌐 **Full-Stack**: Client + Vercel Serverless API
- 🎨 **Modern UI**: Tailwind CSS ile responsive tasarım
- 📱 **3 Şekil**: Daire, Dikdörtgen, Üçgen
- 💾 **SVG Export**: Çizilen şekilleri indir
- ⚡ **Vercel Ready**: Serverless deployment

## 🚀 Çalıştırma

```bash
# Dependencies
npm install

# Development (Vercel dev server)
npm run dev
# → http://localhost:3000

# Build client
npm run build

# Deploy to Vercel
npm run deploy
```

## 🏗️ Mimari

```
src/
├── client/               # Frontend TypeScript
│   ├── main.ts          # Ana uygulama
│   └── apiService.ts    # API client
├── shared/              # Ortak kodlar
│   ├── types.ts         # Interfaces
│   ├── ShapeFactory.ts  # Factory Pattern
│   └── shapes/          # Shape sınıfları
├── services/            # Business logic
│   └── ShapeService.ts  # SVG rendering
api/
└── render.ts            # Vercel serverless endpoint
public/
├── index.html           # Static HTML
└── app.js              # Bundled JS
```

## 🎯 API Usage

```typescript
POST /api/render
Content-Type: application/json

{
  "shapes": [
    {
      "kind": "circle",
      "x": 150, "y": 120, "radius": 50,
      "fill": "#EC1E80", "stroke": "#0f172a", "strokeWidth": 2
    }
  ],
  "canvas": {
    "width": 600, "height": 400, "background": "#f8fafc"
  }
}
```

## 🌐 Vercel Deploy

1. **GitHub'a push et**
2. **Vercel dashboard'da import et**
3. **Otomatik deploy** ✅

**Vercel avantajları:**
- ⚡ Serverless functions
- 🔄 Auto-deploy on push
- 🌍 Global CDN
- 💰 Ücretsiz (hobby plan)
