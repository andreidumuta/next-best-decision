---
name: Executive Analytical Interface
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 32px
  gutter: 24px
  section-gap: 40px
  component-padding-sm: 8px
  component-padding-md: 16px
  component-padding-lg: 24px
---

## Brand & Style

This design system is engineered for high-stakes enterprise decision-making environments. The aesthetic prioritizes cognitive clarity and data density over decorative elements. The brand personality is authoritative, precise, and objective.

The design style follows a **Corporate / Modern** approach with a heavy emphasis on **Minimalism**. It utilizes a systematic structure where information hierarchy is communicated through intentional alignment and white space rather than color or ornamentation. The goal is to create a "neutral canvas" that allows complex data visualizations and critical business metrics to remain the focal point, evoking a sense of calm control and professional reliability.

## Colors

The palette is anchored in deep slates and professional blues to establish a serious, grounded tone. 

- **Primary & Secondary:** Used for text hierarchy, primary actions, and structural elements. The deep slate (#0F172A) provides maximum contrast for readability.
- **Neutrals:** A range of cool grays (Slate) is used for backgrounds, borders, and secondary information to prevent visual fatigue.
- **Functional Color:** Color is strictly reserved for semantic meaning. Success, Warning, and Critical tones are used exclusively for data status indicators, alerts, and performance trends. Decorative use of vibrant colors is prohibited to ensure that when color *is* used, it immediately signals a need for executive attention.

## Typography

This design system utilizes **Inter** for all UI elements to ensure exceptional legibility across varying pixel densities. The type scale is strictly disciplined, using weight and size to create a clear scan-path for users reviewing complex reports.

For tabular data and financial metrics, **JetBrains Mono** is introduced as a secondary utility font to ensure numerical alignment and clarity in data-heavy views. Headings should utilize tighter letter-spacing to maintain a professional, "locked-in" appearance.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop dashboards to ensure data visualizations remain consistent and comparable.

- **Grid:** A 12-column grid with 24px gutters.
- **Rhythm:** An 8px linear scale (with 4px increments for micro-adjustments) governs all margins and padding. 
- **Desktop (1440px+):** Fixed center container of 1280px with 32px side margins.
- **Tablet (768px - 1024px):** Fluid width with 24px margins; 12-column grid collapses to 6 columns for dashboard widgets.
- **Mobile (<768px):** Fluid width with 16px margins; vertical stacking for all widgets and cards.

Structure is created through generous white space between major sections (40px+) to prevent the "clutter" common in enterprise software.

## Elevation & Depth

To maintain a flat, professional aesthetic, this design system avoids heavy shadows. Hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines**.

- **Surface 0 (Background):** The base canvas uses the lightest neutral (#F8FAFC).
- **Surface 1 (Cards/Widgets):** Pure white (#FFFFFF) with a 1px solid border (#E2E8F0).
- **Surface 2 (Popovers/Modals):** Pure white with a very subtle, diffused ambient shadow (0px 4px 20px rgba(15, 23, 42, 0.08)) to indicate temporary interaction layers.

Interactive elements (buttons, inputs) do not use shadows; they utilize subtle background color shifts on hover to maintain a tactile but professional feel.

## Shapes

The shape language is **Soft** but disciplined. 

- **Small Components (Inputs, Buttons):** 4px (0.25rem) radius.
- **Medium Components (Cards, Modals):** 8px (0.5rem) radius.
- **Icons:** Use a 2px stroke weight with consistent square terminators to match the geometric precision of the typography.

Avoid large, pill-shaped buttons or overly rounded corners, as these skew toward a consumer/playful vibe. Sharp corners are avoided to prevent the UI from feeling aggressive, but the radius remains minimal to preserve a structured, architectural feel.

## Components

- **Buttons:** Primary buttons use a solid Slate-900 (#0F172A) background with white text. Secondary buttons use a subtle gray border. All buttons use 4px border-radius and "Label-Caps" typography for a formal appearance.
- **Cards:** Dashboard widgets must use white backgrounds with a 1px border. Title areas within cards should be separated by a subtle 1px horizontal hair-line.
- **Data Tables:** High-density rows (32px-40px height) with light gray dividers (#F1F5F9). Header rows should use "Label-Caps" typography in Slate-500.
- **Inputs:** Text fields use a 1px border (#CBD5E1) and change to a 2px Slate-900 border on focus. No inner shadows.
- **Chips/Badges:** Small, rectangular with a 2px radius. Use low-saturation background tints (e.g., light green background with dark green text) for status indicators to keep the visual weight low.
- **Charts:** Use a coordinated palette of professional blues and grays. Only use the semantic status colors (Red/Yellow/Green) when the data specifically measures performance against a threshold.