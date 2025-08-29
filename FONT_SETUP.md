# Montserrat Font Setup

This document explains how Montserrat Google Font is set up in this Next.js application.

## 🔧 Configuration Files

### 1. Font Configuration (`/lib/fonts.ts`)
```typescript
import { Montserrat } from 'next/font/google'

// Google Fonts - Montserrat
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})
```

### 2. Layout Setup (`/app/layout.tsx`)
```typescript
import { montserrat } from '@/lib/fonts'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### 3. Global CSS (`/app/globals.css`)
```css
:root {
  --font-montserrat: 'Montserrat', system-ui, sans-serif;
}

@layer base {
  html, body {
    font-family: var(--font-montserrat);
  }
}

.font-montserrat {
  font-family: var(--font-montserrat);
}
```

### 4. Tailwind Config (`/tailwind.config.ts`)
```typescript
fontFamily: {
  sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
  'montserrat': ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
}
```

## 🎨 Usage Examples

### Using Tailwind Classes
```tsx
// Default (sans) - uses Montserrat
<p className="font-sans">This uses Montserrat</p>

// Explicit Montserrat
<h1 className="font-montserrat font-bold">Bold Heading</h1>

// Font weights
<p className="font-light">Light text (300)</p>
<p className="font-normal">Regular text (400)</p>
<p className="font-medium">Medium text (500)</p>
<p className="font-semibold">Semibold text (600)</p>
<p className="font-bold">Bold text (700)</p>
```

### Using CSS Variables
```css
.my-custom-class {
  font-family: var(--font-montserrat);
  font-weight: 600;
}
```

## ✅ Features

- **Google Fonts** - Optimized delivery from Google CDN
- **Multiple weights** - 300, 400, 500, 600, 700
- **Optimized loading** - Uses Next.js font optimization
- **Fallback fonts** - System fonts as backup
- **Tailwind integration** - Works with Tailwind classes
- **Performance** - Fonts load with `display: swap`

## 🧪 Testing

To test the fonts, temporarily add the FontTest component to any page:

```tsx
import { FontTest } from '@/lib/fonts.test'

// In your component
<FontTest />
```

## 🚀 Performance Benefits

1. **Zero Layout Shift** - Fonts load with `display: swap`
2. **Optimized Bundle** - Only loads required font weights
3. **Google CDN** - Fast loading from Google's global CDN
4. **Browser Caching** - Fonts cached across sessions

## 📝 Notes

- Fonts are automatically applied to all text elements
- System fonts are used as fallbacks
- Font loading is optimized by Next.js
- No additional setup required for new components
