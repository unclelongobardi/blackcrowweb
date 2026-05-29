# BLACKCROW

> Predict Chaos. Move Markets. Stay Anonymous.

Landing page cinematográfica y ultra oscura para **BLACKCROW**, una red social de mercados de predicción anónimos. Estética minimalista cripto con vibra Bloomberg Terminal + Apple + Cyberpunk.

## Stack

- **Next.js 16** (App Router)
- **TailwindCSS v4**
- **Framer Motion** (animaciones)
- **TypeScript**

## Características

- Navbar fijo con efecto glass al hacer scroll y menú responsive
- Hero con cuervo, headline tipográfico enorme, grid animado y tarjetas de estadísticas flotantes (glassmorphism + glow)
- Ticker de mercados estilo Bloomberg con marquesina infinita
- Dashboard con sidebar, feed estilo crypto Twitter y mercados en tendencia (porcentajes verde/rojo)
- Sección de features con tarjetas glass e iconos
- Footer con registro de email, redes sociales y enlaces

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build de producción

```bash
npm run build
npm start
```

## Estructura

```
src/
  app/
    layout.tsx        # fuentes (Geist + Archivo) y metadata
    page.tsx          # composición de la landing
    globals.css       # tema oscuro, utilidades glass/grid/glow
  components/
    Navbar.tsx
    Hero.tsx
    SocialProof.tsx
    Dashboard.tsx
    Features.tsx
    Footer.tsx
    Logo.tsx          # logo SVG (cuervo geométrico)
    icons.tsx         # set de iconos SVG inline
public/
  images/             # cuervo del hero + referencia
```

## Personalización

Los colores del tema (acento verde, bull/bear, superficies) se definen en `@theme` dentro de `src/app/globals.css`.
