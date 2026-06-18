# Sistema de Diseño — VIA Dashboard

### SaaS Premium · Light Mode · 2026

## 1. Tokens base

| Rol             | Equivalente | Uso                                         |
| :-------------- | :---------- | :------------------------------------------ |
| Brand principal | `#1D4ED8`   | Botones primarios, estados activos, acentos |
| Brand hover     | `#1E40AF`   | Hover sobre elementos brand                 |
| Brand pressed   | `#1e3a8a`   | Estado active / pressed                     |
| Brand sutil     | `#EFF6FF`   | Fondos de badges activos, selected BG       |
| Brand borde     | `#BFDBFE`   | Borde de toggles y elementos activos        |
| App background  | `#F8FAFC`   | Fondo general de la aplicación              |
| Surface / Card  | `#FFFFFF`   | Cards, topbar, sidebar, modales             |
| Borde claro     | `#E2E8F0`   | Divisores, bordes de inputs inactivos       |
| Borde medio     | `#CBD5E1`   | Bordes en hover, separadores fuertes        |

## 2. Tipografía de color

| Rol              | Equivalente | Uso                                           |
| :--------------- | :---------- | :-------------------------------------------- |
| Texto primario   | `#0F172A`   | Títulos `h1`–`h3`, datos críticos             |
| Texto secundario | `#475569`   | Descripciones, labels, texto de lectura       |
| Texto inactivo   | `#94A3B8`   | Placeholders, hints, deshabilitados           |
| Texto inverso    | `#FFFFFF`   | Texto sobre fondos oscuros (sidebar, botones) |

## 3. Sidebar oscuro

| Rol                | Equivalente              | Uso                             |
| :----------------- | :----------------------- | :------------------------------ |
| Fondo sidebar      | `#0F172A`                | Background del sidebar          |
| Hover nav item     | `#1E293B`                | Hover sobre ítems de navegación |
| Nav item activo BG | `rgba(29,78,216,0.18)`   | Fondo del ítem activo           |
| Texto nav inactivo | `rgba(255,255,255,0.55)` | Texto de ítems inactivos        |
| Texto nav activo   | `#93C5FD`                | Texto del ítem activo           |
| Separadores        | `rgba(255,255,255,0.07)` | Divisores internos del sidebar  |

## 4. Estados semánticos

| Estado      | BG         | Texto       | Borde       | Uso típico                              |
| :---------- | :--------- | :---------- | :---------- | :-------------------------------------- |
| **Success** | `green-50` | `green-800` | `green-300` | Infracción guardada, acción completada  |
| **Warning** | `amber-50` | `amber-800` | `amber-300` | Datos incompletos, alerta no crítica    |
| **Danger**  | `red-50`   | `red-800`   | `red-300`   | Error de validación, acción destructiva |
| **Info**    | `blue-50`  | `blue-800`  | `blue-300`  | Mensajes informativos, tooltips         |
| **Neutral** | `slate-50` | `slate-600` | `slate-200` | Estados vacíos, deshabilitados          |

---

## 5. Tipografía

**Fuente:** Inter — añadir en `app/layout.tsx` vía `next/font/google`.

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
```

En `tailwind.config.ts`:

```ts
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
},
```

### Escala tipográfica — clases Tailwind

| Rol                              | Clases Tailwind                                        |
| :------------------------------- | :----------------------------------------------------- |
| `h1` — Título de página          | `text-[22px] font-medium leading-tight text-slate-900` |
| `h2` — Título de sección         | `text-[17px] font-medium leading-snug text-slate-900`  |
| `h3` — Título de card            | `text-sm font-medium leading-snug text-slate-900`      |
| `body` — Texto de lectura        | `text-sm font-normal leading-relaxed text-slate-600`   |
| `label` — Etiquetas de campo     | `text-xs font-medium leading-snug text-slate-600`      |
| `caption` — Hints y placeholders | `text-xs font-normal leading-normal text-slate-400`    |
| `nav` — Ítems de navegación      | `text-[13px] font-normal leading-snug`                 |

> Regla: solo dos pesos en toda la UI — `font-normal` (400) y `font-medium` (500). Nunca `font-semibold` ni `font-bold`.

---

## 6. Espaciado

Tailwind usa una escala base de 4px por unidad (`p-1` = 4px, `p-2` = 8px, etc.). Usar siempre múltiplos del sistema — sin valores arbitrarios como `p-[13px]`.

| Unidad Tailwind   | Valor  | Uso típico                            |
| :---------------- | :----- | :------------------------------------ |
| `gap-1` / `p-1`   | `4px`  | Gap mínimo entre elementos inline     |
| `gap-2` / `p-2`   | `8px`  | Padding de badges y chips             |
| `gap-3` / `p-3`   | `12px` | Gap entre ícono y texto               |
| `gap-4` / `p-4`   | `16px` | Padding de inputs y botones           |
| `gap-5` / `p-5`   | `20px` | Padding interno de cards              |
| `gap-6` / `p-6`   | `24px` | Padding de topbar y footer bar        |
| `gap-8` / `p-8`   | `32px` | Separación entre bloques de contenido |
| `gap-12` / `p-12` | `48px` | Márgenes de página                    |

---

## 7. Border radius

| Token | Clase Tailwind | Valor    | Uso                             |
| :---- | :------------- | :------- | :------------------------------ |
| sm    | `rounded`      | `4px`    | Tags, separadores pequeños      |
| md    | `rounded-md`   | `6px`    | Badges, chips                   |
| lg    | `rounded-lg`   | `8px`    | Inputs, botones, nav items      |
| xl    | `rounded-xl`   | `12px`   | Cards, dropdowns, modales       |
| 2xl   | `rounded-2xl`  | `16px`   | Panels grandes, drawers         |
| full  | `rounded-full` | `9999px` | Píldoras, avatares, step badges |

---

## 8. Sombras

Las sombras están definidas como tokens custom en `tailwind.config.ts` usando `rgba(15,23,42,…)` — el mismo tono que `slate-900` — para evitar el negro puro que produce sombras sucias.

```ts
boxShadow: {
  'sm':    '0 1px 2px 0 rgba(15,23,42,0.05)',
  'card':  '0 1px 3px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.04)',
  'md':    '0 4px 6px -1px rgba(15,23,42,0.04), 0 2px 4px -2px rgba(15,23,42,0.03)',
  'modal': '0 20px 25px -5px rgba(15,23,42,0.06), 0 8px 10px -6px rgba(15,23,42,0.04)',
},
```

| Clase          | Uso                                  |
| :------------- | :----------------------------------- |
| `shadow-sm`    | Inputs en focus, botones secundarios |
| `shadow-card`  | Cards estándar del dashboard         |
| `shadow-md`    | Cards elevadas, dropdowns            |
| `shadow-modal` | Modales y overlays                   |

> Regla: las cards usan `border border-slate-200 shadow-card` juntos. El borde define el límite, la sombra da profundidad. Nunca solo sombra sin borde en light mode.

---

## 9. Íconos — Lucide React

**Librería:** [Lucide React](https://lucide.dev/icons/)  
**Instalación:** `npm install lucide-react`

```tsx
import { UserCheck, UserX, CircleCheck, CircleX, Info } from "lucide-react";
```

### Tamaños estándar

| Contexto                | Prop        | Clase Tailwind equivalente |
| :---------------------- | :---------- | :------------------------- |
| Inline (junto a texto)  | `size={16}` | `w-4 h-4`                  |
| Botones y nav items     | `size={18}` | `w-[18px] h-[18px]`        |
| Decorativo / encabezado | `size={20}` | `w-5 h-5`                  |
| Máximo permitido        | `size={24}` | `w-6 h-6`                  |

### Uso correcto

```tsx
// Ícono decorativo — siempre aria-hidden
<UserCheck size={18} aria-hidden="true" />

// Ícono funcional (botón solo con ícono) — requiere aria-label en el botón
<button aria-label="Marcar como presente">
  <UserCheck size={18} />
</button>

// Con color heredado del padre (recomendado)
<span className="text-blue-700 flex items-center gap-2">
  <CircleCheck size={16} aria-hidden="true" />
  Es titular
</span>
```

### Íconos recomendados por contexto

| Contexto                | Ícono Lucide     |
| :---------------------- | :--------------- |
| Ciudadano presente      | `UserCheck`      |
| Ciudadano ausente       | `UserX`          |
| Es titular              | `CircleCheck`    |
| No es titular           | `CircleX`        |
| Información / hint      | `Info`           |
| Alerta / warning        | `AlertTriangle`  |
| Error / danger          | `AlertCircle`    |
| Éxito                   | `CheckCircle`    |
| Siguiente / avanzar     | `ArrowRight`     |
| Atrás / retroceder      | `ArrowLeft`      |
| Inicio / home           | `Home`           |
| Capturar / cámara       | `Camera`         |
| Infracciones realizadas | `ClipboardCheck` |
| Perfil / usuario        | `User`           |
| Cerrar sesión           | `LogOut`         |
| Notificaciones          | `Bell`           |
| Calendario / fecha      | `Calendar`       |
| Configuración           | `Settings`       |
| Vehículo                | `Car`            |
| Ubicación               | `MapPin`         |
| Buscar                  | `Search`         |

> Regla: Lucide solo tiene variante outline — no existe modo filled. El color siempre hereda del contexto via `currentColor`. No pasar prop `color` directamente al ícono; controlar desde la clase del padre.

---

## 10. Componentes — clases Tailwind

### 10.1 Botón primario

```tsx
// Base
<button
  className="
  bg-blue-700 text-white text-[13px] font-medium
  px-4 py-2 rounded-lg border-none
  hover:bg-blue-800
  active:bg-blue-900 active:scale-[0.99]
  disabled:bg-blue-200 disabled:text-blue-300 disabled:cursor-not-allowed
  transition-colors duration-150
  flex items-center gap-2
"
>
  Siguiente
  <ArrowRight size={16} aria-hidden="true" />
</button>
```

### 10.2 Botón secundario

```tsx
<button
  className="
  bg-transparent text-slate-600 text-[13px] font-normal
  px-4 py-2 rounded-lg border border-slate-200
  hover:bg-slate-50 hover:border-slate-300
  active:bg-slate-100
  transition-colors duration-150
"
>
  Atrás
</button>
```

### 10.3 Toggle de selección (Presente / Ausente)

```tsx
// Estado inactivo
<button className="
  flex items-center justify-center gap-2
  bg-slate-50 border border-slate-200 text-slate-400
  text-[13px] font-normal px-4 py-2.5 rounded-lg
  hover:bg-slate-100 hover:border-slate-300
  transition-colors duration-150 w-full
">
  <UserX size={16} aria-hidden="true" />
  Ausente
</button>

// Estado activo (seleccionado)
<button className="
  flex items-center justify-center gap-2
  bg-blue-50 border-[1.5px] border-blue-700 text-blue-700
  text-[13px] font-medium px-4 py-2.5 rounded-lg
  transition-colors duration-150 w-full
">
  <UserCheck size={16} aria-hidden="true" />
  Presente
</button>
```

> El borde activo es `border-[1.5px]` — única excepción al `border` estándar. Es deliberado para que el estado seleccionado sea inconfundible.

### 10.4 Card de sección

```tsx
<div
  className="
  bg-white border border-slate-200 rounded-xl
  p-5 shadow-card mb-3
"
>
  {/* contenido */}
</div>
```

### 10.5 Input de texto

```tsx
<input
  className="
  bg-white border border-slate-200 rounded-lg
  px-3 py-2 text-sm text-slate-900 h-[38px] w-full
  placeholder:text-slate-400
  focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10
  aria-[invalid=true]:border-red-300 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200/50
  transition-shadow duration-150
"
/>
```

### 10.6 Badge / Chip de estado

```tsx
// Info / activo
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-800">
  <Info size={12} aria-hidden="true" />
  Paso 1 de 9
</span>

// Success
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-800">
  <CheckCircle size={12} aria-hidden="true" />
  Guardado
</span>

// Warning
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800">
  <AlertTriangle size={12} aria-hidden="true" />
  Incompleto
</span>

// Danger
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-800">
  <AlertCircle size={12} aria-hidden="true" />
  Error
</span>
```

### 10.7 Step badge (Paso X de 9)

```tsx
<span
  className="
  inline-flex items-center gap-1.5
  bg-blue-50 text-blue-700
  text-[11px] font-medium
  px-2.5 py-1 rounded-full mb-2
"
>
  <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
  Paso 1 de 9
</span>
```

### 10.8 Progress dots (stepper)

```tsx
<div className="flex items-center gap-1.5 mt-3">
  {steps.map((_, i) => (
    <span
      key={i}
      className={
        i === current
          ? "h-[7px] w-5 rounded bg-blue-700" // activo
          : i < current
            ? "h-[7px] w-[7px] rounded-full bg-blue-700 opacity-35" // completado
            : "h-[7px] w-[7px] rounded-full bg-slate-200" // pendiente
      }
    />
  ))}
</div>
```

### 10.9 Nav item del sidebar

```tsx
// Base
<NavLink
  className={({ isActive }) =>
    `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] transition-colors duration-150 ${
      isActive
        ? "bg-blue-900/20 text-blue-300"
        : "text-white/55 hover:bg-slate-800 hover:text-white/75"
    }`
  }
>
  <Camera size={16} aria-hidden="true" />
  Capturar
</NavLink>
```

### 10.10 Avatar / iniciales

```tsx
<div
  className="
  w-8 h-8 rounded-full bg-blue-700
  text-white text-xs font-medium
  flex items-center justify-center
  select-none
"
>
  CB
</div>
```

### 10.11 Hint de campo (texto de ayuda)

```tsx
<p className="flex items-center gap-1.5 text-xs text-blue-700 mt-2">
  <Info size={13} aria-hidden="true" />
  El conductor se encuentra en el lugar de la infracción
</p>
```

---

## 11. Configuración Tailwind CSS completa

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(15,23,42,0.05)",
        card: "0 1px 3px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.04)",
        md: "0 4px 6px -1px rgba(15,23,42,0.04), 0 2px 4px -2px rgba(15,23,42,0.03)",
        modal:
          "0 20px 25px -5px rgba(15,23,42,0.06), 0 8px 10px -6px rgba(15,23,42,0.04)",
      },
    },
  },
};

export default config;
```

> La paleta completa (slate, blue, green, amber, red, white) ya está incluida en Tailwind por defecto — no se declara nada extra en `colors`. Las únicas extensiones son `fontFamily` (para Inter) y `boxShadow` (para las sombras premium).

---

_VIA Design System · v1.1 · Junio 2026_
