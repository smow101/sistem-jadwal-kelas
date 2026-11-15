---
name: Academic Schedule & Operations System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464556'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4f3feb'
  primary: '#402cdd'
  on-primary: '#ffffff'
  primary-container: '#5a4cf5'
  on-primary-container: '#eae6ff'
  inverse-primary: '#c4c0ff'
  secondary: '#5b5796'
  on-secondary: '#ffffff'
  secondary-container: '#bbb7fd'
  on-secondary-container: '#494683'
  tertiary: '#7c4100'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f5500'
  on-tertiary-container: '#ffe3d0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c0ff'
  on-primary-fixed: '#110068'
  on-primary-fixed-variant: '#351ad4'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c0ff'
  on-secondary-fixed: '#16114f'
  on-secondary-fixed-variant: '#433f7c'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system is engineered for higher education academic schedule planning, course dispatching, and student curriculum navigation ("Sistem Jadwal Kuliah"). It merges high-focus institutional reliability with contemporary clarity.

The visual style is **Modern Surface Contrast Flat**, taking direct visual cues from clean academic dashboards:
- A structural dark indigo monolithic sidebar anchors primary orientation, giving stability and authority to the application shell.
- A crisp ice blue surround frames the content stage, holding pure white workspace panels.
- Visual depth is achieved strictly through perimeter contrast, surface tints, and crisp hairline division rather than synthetic drop shadows. The design enforces an explicit zero-shadow constraint for clean, distraction-free visual processing across dense tabular and calendar matrices.
- The tone is focused, academic, organized, and frictionless.

## Colors

The palette establishes strict semantic zoning across functional areas:

- **Primary Accent (`#5A4CF5`):** The primary interaction driver. Used for active tabs, selected schedule slots, primary buttons, lecture timeline current markers, and key status badges.
- **Deep Indigo / Chrome Surface (`#282460`):** Reserved for persistent navigation chrome, left-hand sidebar navigation, high-contrast modal backdrops, and active schedule group containers.
- **Surround Background (`#EEF2F8`):** An ice-tinted neutral floor that creates clear separation around elevated white workspace islands.
- **Surface Canvas (`#FFFFFF`):** Pure white used for data cards, schedule grids, calendar matrices, lecture cards, and dropdown sheets.
- **Hairline Dividers (`#E2E8F0` / `#E5E7EB`):** 1px structural borders dividing periods, courses, table rows, and headers.
- **Dark Ink Body & Headers (`#0F172A` / `#1E1B4B`):** Deep ink typography providing maximum legibility for course codes, timeslots, and room numbers.
- **Muted Slate (`#64748B`):** Supporting metadata, lecturer credentials, credit points (SKS), and secondary labels.
- **Conflict Warning (`#D97706` text on `#FEF3C7` background):** Immediate callout for classroom overlaps, credit credit hour clashes, and pending curriculum approvals.
- **Status Success (`#16A34A` text on `#ECFDF5` background):** Confirmed enrollments, completed credit quotas, and open capacity indicators.

## Typography

The type system is powered by **Plus Jakarta Sans**, selected for its geometric legibility, open counters, and structured numerical tabular performance.

- **Numerics & Time Slots:** Standard tabular figure alignment applies to timeslot bounds (`08:00 - 09:40`), room codes (`LAB-302`), and credit values (`3 SKS`).
- **Hierarchy Mapping:**
  - `headline-xl` is reserved for major dashboard greetings and semester status markers.
  - `headline-md` and `headline-sm` govern module card titles, week day dividers, and calendar headers.
  - `body-md` serves as default dense table cell copy and lecture meta.
  - `label-sm` is styled in uppercase with `letterSpacing: 0.05em` for status chips, course category badges (Wajib/Pilihan), and timestamp anchors.

## Layout & Spacing

The layout is built around a split-shell workspace model:
- **Navigation Anchor (Left Sidebar):** Fixed width of `260px` on desktop, rendered in solid `#282460`. It holds brand identity, current term switchers, and high-level routing. On tablet and mobile viewports, it collapses to an off-canvas drawer or compact bottom dock.
- **Content Canvas (Main Stage):** Set on an `#EEF2F8` floor containing nested cards and table panels.
- **Grid Architecture:** Desktop workspace uses a fluid 12-column subgrid with a `1.25rem` (`20px`) gutter. Timetables span across daily columns (Monday through Saturday) with medium-density row slots locked to 48px baseline increments.
- **Padding Discipline:** Inner panel content conforms to `1.5rem` (`space-lg`), while table cells and daily calendar cards utilize tight `0.75rem` vertical by `1rem` horizontal padding to maximize visible class information without scroll fatigue.

## Elevation & Depth

This design system operates under an absolute **zero box-shadow rule**. Visual stratification is executed exclusively through tonal surface tiers and boundary hairlines:

1. **Floor Level (Canvas 0):** Outer surround background in `#EEF2F8`.
2. **Structural Shell (Chrome):** Left navigation panel in flat `#282460`.
3. **Workspace Panels (Surface 1):** Pure `#FFFFFF` panels bounded by a continuous 1px solid hairline (`#E2E8F0`).
4. **Nested Content Tiles (Surface 2):** Inactive class slots, search fields, and secondary metrics set in `#F8FAFC` or `#EEF2F8` with no border or subtle `#E2E8F0` bounds.
5. **Interactive / Selected Tiles (Surface 3):** Active lectures take a saturated fill of `#5A4CF5` with pure white text, or a high-contrast outline (`1.5px solid #5A4CF5`) over `#FFFFFF`.
6. **Alert Surfaces:** Clashing schedule warnings use a flat `#FEF3C7` fill framed with a 1px `#FDE68A` border.

## Shapes

The design balances clean institutional professionalism with soft, modern touchpoints:
- Primary content containers, timetable cards, and calendar blocks use `rounded-xl` (`1rem` / `16px`).
- Interactive inputs, filter dropdowns, buttons, and alert strips use `rounded-lg` (`0.5rem` / `8px`).
- Miniature status tags, room badges, and category labels utilize full pill geometry (`9999px`).
- The persistent left sidebar maintains a flush vertical edge against the canvas, with optional smooth interior fillet treatment on desktop screen margins.

## Components

### Buttons
- **Primary:** Saturated `#5A4CF5` fill, `#FFFFFF` text, `rounded-lg`, zero shadow. Hover state shifts to `#4B3CE3`; active state compresses slightly (`transform: scale(0.99)`).
- **Secondary / Outline:** `#FFFFFF` fill with 1px `#E2E8F0` border and `#0F172A` text. Hover state shifts background to `#F1F5F9` with border `#CBD5E1`.
- **Destructive / Drop Course:** Transparent surface, `#DC2626` text, 1px `#FCA5A5` border on hover.

### Chips & Badges
- **Status (Pill):** Height `24px`, padding `0.125rem 0.625rem`.
- **Wajib (Compulsory):** Background `#EEF2FF`, text `#4F46E5`.
- **Pilihan (Elective):** Background `#F1F5F9`, text `#475569`.
- **Schedule Conflict Alert:** Background `#FEF3C7`, text `#B45309`, left-accented hairline border.

### Input Fields & Search Bars
- Background `#FFFFFF` or `#F8FAFC`, framed by 1px `#E2E8F0`.
- Text `#0F172A`, placeholder `#94A3B8`.
- Focus state: Border color transitions directly to `#5A4CF5` with 0px glow or shadow.

### Timetable & Calendar Cells
- Daily columns framed by 1px `#E2E8F0` horizontal and vertical hairlines.
- Free periods render as faint dashed hairlines (`#E2E8F0`) on transparent/white background.
- Scheduled Class Card: Solid background (`#FFFFFF` with 1px border or `#5A4CF5` for ongoing class), `rounded-lg`, containing course code, lecture title, room name, and lecturer avatar or name tag.

### Data Tables
- Medium vertical density with row heights fixed at `48px`.
- Header row styled in `#F8FAFC` with uppercase `label-sm` muted text (`#64748B`).
- Row borders: 1px hairline `#E2E8F0`. Zero alternate striping; hover creates a flat `#F8FAFC` background shift.

### Conflict Modal & Banner
- Pure white panel framed with a 1.5px `#F59E0B` warning outline.
- Warning glyph accompanied by specific clash details: room double-booking or overlapping timeslot intervals.