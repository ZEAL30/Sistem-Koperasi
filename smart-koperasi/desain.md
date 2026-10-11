---
name: Smart Koperasi Design System
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
  on-surface-variant: '#3f4945'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6f7974'
  outline-variant: '#bfc9c3'
  surface-tint: '#256956'
  primary: '#004132'
  on-primary: '#ffffff'
  primary-container: '#0f5a47'
  on-primary-container: '#8ccfb7'
  inverse-primary: '#90d4bc'
  secondary: '#7a5900'
  on-secondary: '#ffffff'
  secondary-container: '#fdbc13'
  on-secondary-container: '#6b4d00'
  tertiary: '#2e394c'
  on-tertiary: '#ffffff'
  tertiary-container: '#455064'
  on-tertiary-container: '#b7c2da'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf1d7'
  primary-fixed-dim: '#90d4bc'
  on-primary-fixed: '#002118'
  on-primary-fixed-variant: '#00513f'
  secondary-fixed: '#ffdea3'
  secondary-fixed-dim: '#fdbc13'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  surface-white: '#FFFFFF'
  danger-red: '#DC2626'
  danger-surface: '#FEF2F2'
  success-green: '#16A34A'
  success-surface: '#F0FDF4'
  warning-surface: '#FEFCE8'
  border-subtle: '#E2E8F0'
  border-emerald-light: '#A7F3D0'
  text-muted: '#64748B'
  surface-subtle: '#F1F5F9'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
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
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  currency-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  currency-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes a trustworthy, modern cooperative banking interface that bridges institutional integrity with contemporary fintech usability. Built to serve both everyday cooperative members (*Anggota*) and back-office administrators (*Pengurus*), the visual tone balances community-driven financial prosperity with rigorous enterprise security.

The design movement is **Corporate Modern with Tactile Refinement**. It emphasizes crisp, readable data structures, clear visual hierarchies, and reassuring financial visual cues. Rather than cold austerity, it employs deep botanical greens, warm gold accents, and subtle borders to evoke steady growth, transparency, and safety. Every screen prioritizes legibility, structured forms, and unambiguous confirmation states to eliminate financial anxiety and empower seamless transactions.

## Colors

The palette grounds itself in financial credibility and civic prosperity:
- **Primary (`#0F5A47` - Deep Emerald Green):** Represents fiscal stability, cooperative growth, and authority. Applied to primary call-to-actions, brand elements, active navigation anchors, and key financial metric headers.
- **Secondary (`#F4B400` - Warm Gold):** The cooperative symbol of shared prosperity and mutual aid. Reserved for high-value highlights, badges, pending statuses, and special member incentives.
- **Tertiary (`#1E293B` - Deep Charcoal):** Provides high-contrast legibility for primary text, table headers, and structural admin navigation frames.
- **Neutral (`#F8FAFC` - Clean Slate):** A crisp, low-glare canvas background that separates white card surfaces cleanly without harsh contrast.

Semantic alert colors (such as Ruby Red `#DC2626` for overdue balances, errors, and critical confirmation dialogs) ensure immediate recognition across dense accounting interfaces.

## Typography

The typography pairing uses **Plus Jakarta Sans** for prominent headers, brand moments, and currency readings alongside **Inter** for compact functional controls, form labels, and financial data grids.

- **Numerics & Currency:** Financial values (e.g., *Simpanan Wajib*, *Sisa Pinjaman*, *SHU*) utilize tabular figure settings (`tnum`) with negative tracking on displays to prevent layout shifts during live balance tallies.
- **Hierarchy:** Auth screens prioritize warm, welcoming headline hierarchies, while admin tables rely on compact Inter labels with crisp uppercase tracking for clarity in audit logs and member rosters.

## Layout & Spacing

This design system uses a strict **fluid-responsive 12-column grid** on desktop screen sizes (breakpoint 1024px+), collapsing to an 8-column layout on tablets (768px - 1023px) and a single-column 4-grid system on mobile devices (<768px).

- **Authentication Layouts:** Utilize a centered layout format with a maximum width of `480px` on desktop, encased within an elevated security card.
- **Admin & Member Dashboards:** Rely on a fixed left rail (`260px` sidebar) on desktop, transitioning into an off-canvas drawer on mobile and tablet views.
- **Content Rhythms:** Vertical rhythm is tied to an 8px base grid (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 32px). Data-dense transaction summaries maintain tight `space-sm` row padding to maximize screen utility without clutter.

## Elevation & Depth

Visual hierarchy leverages a hybrid of **tonal layering and low-contrast ambient borders** to establish institutional stability:

- **Level 0 (Canvas Base):** Clean Slate `#F8FAFC`. Background for all main work areas.
- **Level 1 (Card Surfaces & Containers):** Pure White `#FFFFFF` with a crisp structural hairline border (`1px solid #E2E8F0`). Flat appearance during idle states with an ultra-subtle diffuse drop shadow: `0 1px 3px rgba(15, 90, 71, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)`.
- **Level 2 (Hovered Cards & Dropdowns):** Elevated with an emerald-tinted shadow: `0 10px 15px -3px rgba(15, 90, 71, 0.08), 0 4px 6px -2px rgba(15, 90, 71, 0.04)`.
- **Level 3 (Modal Dialogs & Auth Overlays):** High-priority focus containers using `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 10px 10px -5px rgba(15, 23, 42, 0.04)` combined with a frosted backdrop overlay (`rgba(30, 41, 59, 0.5)` with `backdrop-filter: blur(4px)`).

## Shapes

The design system implements a **Rounded (Level 2)** shape standard:
- Default elements (buttons, text inputs, badge pills, dropdown triggers) carry a `0.5rem` (8px) radius.
- Structural container cards and modal dialogs use `1rem` (16px) for an approachable, modern feel.
- Large focal cards (such as the authentication container and member balance hero cards) utilize `1.5rem` (24px) radius.
- Small avatar badges and tag indicators adopt fully rounded pill geometry (`rounded-full` / `9999px`) to visually separate metadata from actionable controls.

## Components

### Buttons
- **Primary Button:** Background Deep Emerald `#0F5A47`, text `#FFFFFF`, font `Inter 600`. Hover state darkens to `#0B4435` with subtle elevation. Active scale `0.98`. Focus ring: `3px` spread of `#0F5A47` at 20% opacity.
- **Secondary Button:** Surface Pure White `#FFFFFF`, border `1px solid #E2E8F0`, text Charcoal `#1E293B`. Hover state applies background `#F8FAFC` and border `#CBD5E1`.
- **Accent Button:** Warm Gold `#F4B400`, text Charcoal `#1E293B`, for priority member incentives or fast-track loan applications.
- **Danger Button:** Ruby Red `#DC2626`, text `#FFFFFF`. Reserved for session logout modals, account deactivations, and loan rejection workflows.

### Form Inputs & Floating Fields
- **Idle State:** Surface `#FFFFFF`, border `1px solid #CBD5E1`, text `#1E293B`, placeholder `#94A3B8`.
- **Focus State:** Border shifts to Deep Emerald `#0F5A47`, with a soft outer ring `0 0 0 3px rgba(15, 90, 71, 0.15)`.
- **Validation States:** 
  - *Error:* Ruby Red `#DC2626` border with matching red microcopy below the field and an alert icon right-aligned.
  - *Success:* `#16A34A` border with green verification checkmark.
- **Password Field:** Includes an interactive trailing toggle icon (*Show/Hide Password*) and a dynamic 3-tier password strength bar (*Lemah*, *Sedang*, *Kuat*).
- **OTP Input:** 6 discrete square boxes (`48px x 56px`), centered numerals, auto-advancing with highlighted active border.

### Role Selector (Anggota vs. Pengurus)
Segmented pill switch with an animated white card slider inside a `#F1F5F9` track. Active role displays emerald text with a subtle shadow; inactive role uses muted charcoal `#64748B`.

### Cards & Financial Tiles
- **Balance Card:** Emerald gradient header accent (`#0F5A47` to `#166534`), showcasing aggregate savings (`Simpanan Pokok`, `Wajib`, `Sukarela`) with tabular numbers, accompanied by quick action chips (`Ajukan Pinjaman`, `Bayar Angsuran`).
- **Auth Card:** Clean White `#FFFFFF`, `1.5rem` radius, bordered in `1px solid #E2E8F0`, topped with the cooperative brand mark.

### Modal Dialogs & Toasters
- **Confirmation Modals (e.g., Logout / Approval):** Centered modal with an icon header (e.g., Red shield for logout), plain language consequence warning, and stacked full-width button actions on mobile or inline right-aligned on desktop.
- **Toaster Notifications:** Floating top-right alerts with a solid status-colored leading edge (4px emerald or ruby red bar), supporting auto-dismiss in 4 seconds with a manual dismiss icon button.