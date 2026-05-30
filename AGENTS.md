# FinPay Dashboard — Especificación Técnica de Diseño

---

## 1. RESUMEN VISUAL

- **Categoría:** Fintech / SaaS Dashboard
- **Densidad:** Moderadamente cargado — alta densidad de información bien organizada
- **Tono:** Formal con toques casuales (emojis en saludo, lenguaje cercano)
- **Nivel de sofisticación:** 8/10
- **Sensación transmitida:** Confianza, control financiero, modernidad, claridad de datos
- **Público objetivo:** Usuarios individuales o prosumers que gestionan finanzas personales o de pequeña empresa; millennials y Gen Z con afinidad tecnológica

---

## 2. PALETA DE COLORES

### Primary

- **HEX:** `#2563EB`
- **RGB:** `rgb(37, 99, 235)`
- **Uso:** Botones principales, elementos activos de sidebar, tarjeta de crédito, barras de progreso activas, íconos destacados

### Secondary

- **HEX:** `#1E3A8A`
- **RGB:** `rgb(30, 58, 138)`
- **Uso:** Fondo de tarjeta de crédito (gradiente oscuro), encabezados de sección, texto de énfasis sobre fondos oscuros

### Accent

- **HEX:** `#60A5FA`
- **RGB:** `rgb(96, 165, 250)`
- **Uso:** Barras de gráficos secundarias (Expense), elementos de progreso secundarios, highlights en estadísticas

### Success

- **HEX:** `#22C55E`
- **RGB:** `rgb(34, 197, 94)`
- **Uso:** Badge "Successful" en tabla de transacciones, indicadores positivos

### Warning

- **HEX:** `#F59E0B`
- **RGB:** `rgb(245, 158, 11)`
- **Uso:** Badge "Pending", alertas de suscripción próxima a vencer

### Danger

- **HEX:** `#EF4444`
- **RGB:** `rgb(239, 68, 68)`
- **Uso:** Badge "Failed", variaciones negativas en estadísticas (`-$2,400`)

### Background

- **HEX:** `#F1F5F9`
- **RGB:** `rgb(241, 245, 249)`
- **Uso:** Fondo general de la aplicación

### Surface

- **HEX:** `#FFFFFF`
- **RGB:** `rgb(255, 255, 255)`
- **Uso:** Cards, sidebar, panel de estadísticas, filas de tabla

### Border

- **HEX:** `#E2E8F0`
- **RGB:** `rgb(226, 232, 240)`
- **Uso:** Separadores de cards, bordes de inputs, divisores de tabla

### Text Primary

- **HEX:** `#0F172A`
- **RGB:** `rgb(15, 23, 42)`
- **Uso:** Títulos, valores monetarios grandes, labels principales

### Text Secondary

- **HEX:** `#64748B`
- **RGB:** `rgb(100, 116, 139)`
- **Uso:** Subtítulos, labels de formulario, texto de metadatos, fechas

---

### Tailwind Mapping

```js
colors: {
  primary:        '#2563EB',   // blue-600
  secondary:      '#1E3A8A',   // blue-900
  accent:         '#60A5FA',   // blue-400
  background:     '#F1F5F9',   // slate-100
  surface:        '#FFFFFF',   // white
  border:         '#E2E8F0',   // slate-200
  'text-primary': '#0F172A',   // slate-900
  'text-secondary':'#64748B',  // slate-500
  success:        '#22C55E',   // green-500
  warning:        '#F59E0B',   // amber-500
  danger:         '#EF4444',   // red-500
}
```

---

## 3. TIPOGRAFÍA

- **Familia principal:** Inter
- **Alternativas similares:** Plus Jakarta Sans, DM Sans, Manrope, Poppins
- **Pesos utilizados:** 400, 500, 600, 700

### Escala tipográfica

| Rol        | Tamaño | Peso | Uso                                       |
| ---------- | ------ | ---- | ----------------------------------------- |
| Display    | 28px   | 700  | Saludo principal ("Hey Lukmon")           |
| Heading    | 22px   | 700  | Valores monetarios grandes ($34,970)      |
| Subheading | 16px   | 600  | Títulos de secciones (Money Statistics)   |
| Body       | 14px   | 400  | Texto de tabla, labels generales          |
| Small      | 12px   | 400  | Metadatos, fechas, notas                  |
| XSmall     | 11px   | 500  | Badges de estado, etiquetas de porcentaje |

---

## 4. SISTEMA DE ESPACIADO

Basado en escala de 4px.

| Token      | Valor |
| ---------- | ----- |
| Padding XS | 4px   |
| Padding SM | 8px   |
| Padding MD | 16px  |
| Padding LG | 24px  |
| Padding XL | 32px  |

### Border Radius

| Elemento           | Radio         |
| ------------------ | ------------- |
| Inputs             | 8px           |
| Cards              | 12px          |
| Buttons            | 8px           |
| Badges             | 9999px (pill) |
| Modals             | 16px          |
| Tarjeta de crédito | 16px          |

---

## 5. SOMBRAS

```css
/* Card Shadow */
box-shadow:
  0 1px 3px rgba(0, 0, 0, 0.06),
  0 1px 2px rgba(0, 0, 0, 0.04);

/* Card Elevated (panels de estadísticas) */
box-shadow:
  0 4px 12px rgba(0, 0, 0, 0.07),
  0 1px 3px rgba(0, 0, 0, 0.04);

/* Modal Shadow */
box-shadow:
  0 20px 60px rgba(0, 0, 0, 0.15),
  0 8px 20px rgba(0, 0, 0, 0.08);

/* Hover Shadow */
box-shadow:
  0 6px 20px rgba(37, 99, 235, 0.15),
  0 2px 6px rgba(0, 0, 0, 0.05);

/* Sidebar/Panel Shadow */
box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
```

---

## 6. BOTONES

### Primary Button

- **Background:** `#2563EB`
- **Border:** none
- **Color texto:** `#FFFFFF`
- **Hover:** `#1D4ED8`
- **Active:** `#1E40AF`
- **Disabled:** `#93C5FD` con `opacity: 0.6`
- **Border Radius:** 8px
- **Font Weight:** 600
- **Padding:** `8px 16px`

### Secondary Button

- **Background:** `#EFF6FF`
- **Border:** `1px solid #BFDBFE`
- **Color texto:** `#2563EB`
- **Hover:** `#DBEAFE`
- **Active:** `#BFDBFE`
- **Disabled:** `opacity: 0.5`
- **Border Radius:** 8px
- **Font Weight:** 500

### Ghost Button

- **Background:** `transparent`
- **Border:** `1px solid #E2E8F0`
- **Color texto:** `#64748B`
- **Hover:** `background: #F8FAFC`
- **Active:** `background: #F1F5F9`
- **Border Radius:** 8px
- **Font Weight:** 400

---

## 7. INPUTS Y FORMULARIOS

### Estado Normal

```css
background: #ffffff;
border: 1px solid #e2e8f0;
border-radius: 8px;
padding: 8px 12px;
font-size: 14px;
color: #0f172a;
```

### Hover

```css
border-color: #cbd5e1;
```

### Focus

```css
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
outline: none;
```

### Error

```css
border-color: #ef4444;
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
```

### Disabled

```css
background: #f8fafc;
color: #94a3b8;
cursor: not-allowed;
```

---

## 8. TABLAS

- **Altura de filas:** 48–52px
- **Color encabezado background:** `#F8FAFC`
- **Color encabezado texto:** `#64748B`, 12px, peso 600, uppercase con letter-spacing
- **Hover row:** `background: #F8FAFC`
- **Separadores:** `border-bottom: 1px solid #F1F5F9`
- **Padding celdas:** `12px 16px`
- **Tipografía cuerpo:** 13–14px, peso 400, `#0F172A`
- **Tipografía metadatos (fecha, hora):** 12px, `#94A3B8`

### Badges de estado

```css
/* Successful */
background: #dcfce7;
color: #16a34a;
border-radius: 9999px;
padding: 2px 10px;
font-size: 12px;

/* Failed */
background: #fee2e2;
color: #dc2626;

/* Pending */
background: #fef3c7;
color: #d97706;
```

---

## 9. CARDS

```css
background: #ffffff;
border: 1px solid #e2e8f0;
border-radius: 12px;
padding: 20px 24px;
box-shadow:
  0 1px 3px rgba(0, 0, 0, 0.06),
  0 1px 2px rgba(0, 0, 0, 0.04);
```

### Tarjeta de crédito (especial)

```css
background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%);
border-radius: 16px;
padding: 24px;
color: #ffffff;
```

### Cards de métricas (Income / Expenses / Savings)

```css
background: #ffffff;
border: 1px solid #e2e8f0;
border-radius: 12px;
padding: 16px 20px;
```

---

## 10. ICONOGRAFÍA

- **Estilo:** Outline / Stroke
- **Grosor:** 1.5px stroke
- **Tamaño predominante:** 16–20px
- **Librería más cercana:** **Lucide Icons**
- **Alternativas:** Heroicons (outline), Feather Icons
- **Uso:** Navegación sidebar, acciones rápidas (Add Fund, Transfer, Internet Data, Split Bill), íconos de notificación, menú contextual (tres puntos)

---

## 11. SISTEMA DE DISEÑO

**Más cercano a:** Custom Design System basado en Tailwind UI + influencias de Shadcn/ui

- Grid de cards flexible tipo CSS Grid
- Sidebar fijo con nav items estilizados como links
- Tokens semánticos claros (surface, border, text-secondary)
- Componentes propios sin dependencia explícita de librería UI identificable

---

## 12. TOKENS DE DISEÑO

```js
const designTokens = {
  colors: {
    primary: "#2563EB",
    primaryDark: "#1E3A8A",
    primaryLight: "#60A5FA",
    primaryMuted: "#EFF6FF",
    success: "#22C55E",
    successBg: "#DCFCE7",
    warning: "#F59E0B",
    warningBg: "#FEF3C7",
    danger: "#EF4444",
    dangerBg: "#FEE2E2",
    background: "#F1F5F9",
    surface: "#FFFFFF",
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  shadows: {
    card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    elevated: "0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
    modal: "0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)",
    hover: "0 6px 20px rgba(37,99,235,0.15), 0 2px 6px rgba(0,0,0,0.05)",
    focus: "0 0 0 3px rgba(37,99,235,0.15)",
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", sans-serif',
    display: { size: "28px", weight: 700 },
    heading: { size: "22px", weight: 700 },
    subheading: { size: "16px", weight: 600 },
    body: { size: "14px", weight: 400 },
    small: { size: "12px", weight: 400 },
    xsmall: { size: "11px", weight: 500 },
  },
};
```

---

## 13. PROMPT DE RECREACIÓN

```
Construye componentes React + TailwindCSS que repliquen exactamente la identidad visual de este dashboard fintech.

Fuente: Inter (700 display, 600 subheadings, 400 body).
Paleta: primary #2563EB, background #F1F5F9, surface #FFFFFF, border #E2E8F0, text-primary #0F172A, text-secondary #64748B.
Estados de color: success #22C55E, warning #F59E0B, danger #EF4444.
Radios: cards 12px, botones 8px, badges pill (9999px), modals 16px.
Sombras: cards con `0 1px 3px rgba(0,0,0,0.06)`, elevadas con `0 4px 12px rgba(0,0,0,0.07)`.
Spacing en múltiplos de 4px (4 / 8 / 16 / 24 / 32).
Iconos: Lucide React, outline, stroke 1.5px, 16–20px.
Tablas: filas 48px, hover bg slate-50, separadores slate-100, badges de estado con bg coloreado y texto semántico.
Cards: bg white, border slate-200, radius 12px, padding 20–24px.
Sidebar: bg white, ancho 220px, nav items con icono + label, activo con bg blue-50 y texto blue-600.
Botón primario: bg blue-600, texto white, hover blue-700, radius 8px, font-semibold.
Mantén consistencia visual absoluta. No uses gradientes extravagantes ni sombras agresivas. El estilo es limpio, profesional y de alta densidad informativa sin sensación de saturación.
```

---

## 14. COMPONENTE ANALIZADO — GUÍA DE IMPLEMENTACIÓN

### Header / Topbar

- Altura: ~64px
- Contenido: saludo personalizado con emoji a la izquierda; search bar centrado-derecha con shortcut `⌘K`; ícono de notificación
- Search bar: border `#E2E8F0`, radius 8px, bg white, placeholder en slate-400
- Sin background propio: hereda el `#F1F5F9` del layout

### Sidebar

```
Ancho: 220px fijo
Background: #FFFFFF
Border right: 1px solid #E2E8F0
Padding: 24px 12px
Nav sections: label uppercase 10px slate-400 mb-8px
Nav item: flex row, gap 10px, padding 8px 12px, radius 8px
  - Activo: bg #EFF6FF, text #2563EB, icon #2563EB
  - Hover: bg #F8FAFC
  - Inactivo: text #64748B, icon #94A3B8
Footer: avatar + nombre + email + badge Pro (bg azul, texto blanco, 11px)
```

### Tarjeta de crédito (Credit Card)

```
width: 100% del panel izquierdo (~280px)
height: ~160px
background: linear-gradient(135deg, #2563EB, #1E3A8A)
border-radius: 16px
padding: 24px
color: white
Elementos: label "Card Number" (opacity 0.7, 11px), número (20px, 600), "Available Balance" + monto (18px bold), EXP + CVV (12px)
Decorativo: círculo translúcido top-right como elemento de profundidad
```

### Cards de Métricas (Income / Expenses / Savings)

```
Layout: grid 3 columnas, gap 16px
Cada card: bg white, border slate-200, radius 12px, padding 16px 20px
Contenido: ícono en badge redondeado + label 12px slate-500 + valor 22px bold + variación 12px (verde o rojo)
Variación positiva: text #22C55E con flecha ↑
Variación negativa: text #EF4444 con flecha ↓
```

### Acciones Rápidas

```
4 íconos en fila horizontal: Add Fund / Transfer / Internet Data / Split Bill
Cada uno: ícono en cuadrado redondeado (bg slate-100, radius 10px, 40x40px) + label 12px debajo
```

### Daily Limit

```
Card bg white, padding 16px 20px
Barra de progreso: bg slate-100, fill blue-600, radius 9999px, height 6px
Labels izquierda/derecha en 12px
```

### Saving Plans

```
Lista de savings items dentro de card
Cada item: nombre + ícono + menú "..." + barra de progreso + monto actual / meta
Barra: fill blue-600, bg slate-100, height 6px, radius full
```

### Money Statistics (Chart)

```
Área: ocupa columna central, altura ~280px
Tipo: Bar chart agrupado (Income = azul sólido #2563EB, Expense = azul claro #60A5FA)
Tooltip: bg white, shadow elevated, radius 8px, padding 10px
Eje X: meses 3 letras, slate-400, 12px
Eje Y: valores en K, slate-400, 12px
Selector "This Year": ghost button con dropdown
```

### Tabla de Transacciones

```
Header: bg #F8FAFC, texto slate-500 12px uppercase
Filas: altura 48px, hover bg slate-50, border-bottom slate-100
Columnas: Transaction Name + Date/Time + Amount + Note + Status
Amount: bold 14px slate-900
Status badge: pill, bg semántico + texto semántico, 11px 500
```

### Panel de Estadísticas (derecha)

```
Ancho: ~240px fijo
Contenido superior: donut chart con leyenda de categorías
  - Rent 60% → blue-900
  - Investment 15% → blue-300
  - Subscription 12% → pink-300
  - Food 8% → yellow-300
  - Entertainment 5% → blue-400
Cada ítem de leyenda: cuadrado color + nombre + porcentaje + monto (grid 2 cols)
```

### Recent Activity

```
Lista de eventos en sidebar derecho
Secciones: "Today" / "Yesterday" (label 12px bold slate-700)
Item: ícono cuadrado slate-100 + descripción 13px + hora 11px slate-400
Separador entre secciones: margin 12px
```

### Footer

```
bg white o hereda layout
Contenido: Copyright 2025 Finpay | Privacy Policy | Terms | Contact (12px slate-400)
Iconos sociales: Facebook, X, Instagram, YouTube, LinkedIn (slate-400, 18px)
```
