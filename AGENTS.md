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
