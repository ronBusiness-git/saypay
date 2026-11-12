---
name: SayPay Design System
colors:
  surface: '#f6faff'
  surface-dim: '#cddcea'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ebf5ff'
  surface-container: '#e1f0fe'
  surface-container-high: '#dbeaf8'
  surface-container-highest: '#d6e4f2'
  on-surface: '#0f1d27'
  on-surface-variant: '#3e4945'
  inverse-surface: '#24323c'
  inverse-on-surface: '#e5f2ff'
  outline: '#6e7a75'
  outline-variant: '#bdc9c3'
  surface-tint: '#006b57'
  primary: '#006451'
  on-primary: '#ffffff'
  primary-container: '#087f68'
  on-primary-container: '#d2ffef'
  inverse-primary: '#78d8bd'
  secondary: '#52606c'
  on-secondary: '#ffffff'
  secondary-container: '#d5e4f2'
  on-secondary-container: '#586672'
  tertiary: '#914000'
  on-tertiary: '#ffffff'
  tertiary-container: '#b5540a'
  on-tertiary-container: '#fff3ee'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#94f5d8'
  primary-fixed-dim: '#78d8bd'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#005141'
  secondary-fixed: '#d5e4f2'
  secondary-fixed-dim: '#bac8d6'
  on-secondary-fixed: '#0f1d27'
  on-secondary-fixed-variant: '#3a4853'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#f6faff'
  on-background: '#0f1d27'
  surface-variant: '#d6e4f2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a voice-first, highly reliable, and reassuring interface for an intelligent payment companion operating within the PayPal Sandbox environment. Voice-driven financial interactions carry inherent friction around ambiguity and accuracy; the UI directly counterbalances this with absolute visual clarity, structured predictability, and decisive visual verification.

The visual direction combines **Contemporary Financial Clarity** with **Restrained Tactile Utility**:
- **Attitude**: Vigilant, composed, articulate, and completely transparent.
- **Target Audience**: Developers, merchants, and end-users auditing or executing voice-prompted sandbox transactions where clarity on payment states is mission-critical.
- **Emotional Resonance**: Reassurance ("my payment is completely understood"), confidence in safety checks, and immediate situational awareness regarding mock vs. production states.
- **Theme Constraints**: Light theme only. Pure white operational containers sit elevated over a warm, low-glare canvas to sustain high readability during prolonged testing cycles.

## Colors

The palette balances deep organic emerald tones with crisp slate neutrals and strict semantic validation colors. Every color role has a dedicated operational purpose, minimizing cognitive load during spoken verification loops.

### Core Canvas & Structure
- **Canvas Base (`#F7F8FA`)**: Warm off-white page background providing soft, glare-free contrast against interactive surfaces.
- **Surface Elevation (`#FFFFFF`)**: Pure white reserved strictly for actionable cards, modal dialogs, and voice transcription modules.
- **Surface Stroke (`#DFE5E8`)**: Muted, low-contrast border separating surface containers without visual noise.

### Action & Brand Signals
- **Primary Brand / Action (`#087F68`)**: Deep emerald indicating decisive confirmation, authorized actions, and primary flow completion.
- **Primary Action Hover (`#066653`)**: High-intent, grounded forest green for interactive hover states.
- **Subtle Accent (`#EAF7F1`)**: Soft emerald tint for selected states, voice listening pulse indicators, and active badges.

### Typography & Content Contrast
- **Primary Text (`#15232D`)**: Dark slate with high optical weight for headlines, transactional amounts, and synthesized voice transcripts.
- **Secondary Text (`#62707C`)**: Muted graphite for secondary metadata, field titles, helper copy, and acoustic confidence levels.

### Semantic Transaction States
- **Success / CLEAR / COMPLETED (`#107E3E`)**: Confirmed payment settlement, validated sandbox payload, clean safety verification.
- **Review Required / Sandbox Attention (`#B45309`)**: Amber indicator for voice transcript uncertainty, required manual confirmation, and the sticky Sandbox environment banner.
- **BLOCKED / FAILED (`#DC2626`)**: Immediate halt state for fraud rules, mismatched amounts, or declined mock calls.
- **Pending / PAY_CONFIRMED (`#1D4ED8`)**: Structured cobalt denoting asynchronous authorization and sandbox webhook polling.
- **CANCELLED (`#6B7280`)**: Neutral slate grey for user-voided actions or abandoned voice intents.
- **UNKNOWN (`#7E22CE`)**: Deep violet indicating unmatched voice intent, unparsed syntax, or anomalous sandbox payloads.

## Typography

The typography system relies on **Inter** for clean, neutral readability across numeric transactional data and voice transcription feeds. Type is strictly anti-aliased with disciplined letter-spacing to prevent visual crowding when displaying monetary figures.

### Monospaced Technical Styling
All transactional hashes, PayPal sandbox account IDs, authorization tokens, voice waveform debug parameters, and API response codes break out of the primary sans-serif family into **JetBrains Mono** (`code-md`, `code-sm`). This makes developer-facing sandbox telemetry instantly identifiable from human-spoken prompts.

### Voice Display Rules
- Spoken phrase transcriptions use `headline-md` with `font-weight: 500` to mirror real-time voice synthesis.
- Recognized entities (e.g., "$45.00", "David Miller") within speech strings must be highlighted with a `600` weight and darkened to `#15232D` against muted `#62707C` speech filler.

## Layout & Spacing

The layout employs a structured fluid-responsive grid system designed to support dual monitor testing, desktop sandbox workflows, and mobile viewport simulations.

### Grid Anatomy
- **Mobile (<768px)**: 4 columns, `margin: 1rem` (16px), `gutter: 1.25rem` (20px). Flow is vertical with persistent voice listening controls anchored at the bottom edge.
- **Tablet (768px - 1024px)**: 8 columns, `margin: 1.5rem` (24px), `gutter: 1.25rem` (20px).
- **Desktop (>1024px)**: 12 columns, max content container width `1280px`, `margin: 2.5rem` (40px), `gutter: 1.5rem` (24px). Split view places voice audit telemetry in a dedicated 4-column side pane alongside the 8-column transaction inspector.

### Ergonomics & Touch Footprint
All interactive inputs, voice activation switches, and transaction approval buttons adhere to a mandatory **minimum hit target of 44px x 44px**. Spacing rhythm uses multiples of 4px/8px to ensure mathematical alignment between tabular financial data and interactive form fields.

## Elevation & Depth

To preserve trust and surgical legibility, elevation avoids heavy dramatic drops, relying instead on ambient, highly diffused lighting and structural perimeter strokes.

### Stacking Hierarchy
1. **Base Surface (0dp)**: Canvas `#F7F8FA`. No elevation.
2. **Card & Surface Tiers (1dp)**: Pure `#FFFFFF` surfaces bounded by a continuous `1px` border of `#DFE5E8`. Reinforced with an ambient shadow: `box-shadow: 0 1px 3px rgba(21, 35, 45, 0.04), 0 4px 12px rgba(21, 35, 45, 0.03)`.
3. **Floating Controls & Modals (2dp)**: Spoken prompt triggers, contextual popovers, and sticky elements: `box-shadow: 0 4px 6px -1px rgba(21, 35, 45, 0.06), 0 10px 24px -2px rgba(21, 35, 45, 0.08)`.
4. **Sandbox Global Status (Fixed)**: A static or sticky top utility bar featuring `#B45309` styling that separates testing mode from production reality without casting drop shadows over core navigational actions.

## Shapes

The design system enforces a differentiated geometric language separating organizational cards from interactive controls:

- **Surface & Container Radii**: All primary cards, summary panels, and dialog surfaces strictly employ **16px (`1rem`)** corner rounding to create friendly, architectural boundaries.
- **Interactive Control Radii**: Buttons, input containers, voice waveform pill indicators, and dropdown triggers standardize on **10px (`0.625rem`)** corner rounding. This subtle divergence ensures that interactive targets feel distinct from the structural surfaces hosting them.
- **Pills & Status Badges**: Micro-chips, transaction state tags, and audio monitoring pips utilize full boundary radius (`rounded-full` / `9999px`) to distinguish actionable states from static data.

## Components

### Sticky Sandbox Banner
- **Placement**: Fixed to the absolute top of the viewport (`z-index: 50`).
- **Styling**: Background `#FEF3C7`, border bottom `1px solid #FCD34D`, typography `label-md` colored `#B45309`.
- **Content**: Explicit warning indicating active PayPal Sandbox test credentials, mock currency balances, and simulated payment gateways.

### Buttons & Voice Triggers
- **Primary Action**: Minimum height `44px`, background `#087F68`, text `#FFFFFF`, border-radius `10px`, padding `0 1.25rem`. Hover state `#066653`. Focus ring `3px solid #EAF7F1`.
- **Secondary Action**: Minimum height `44px`, background `#FFFFFF`, text `#15232D`, border `1px solid #DFE5E8`, border-radius `10px`. Hover state `#F7F8FA`.
- **Voice Mic Trigger**: Circular `56px` or `44px` action. In listening state: background `#EAF7F1`, icon `#087F68`, encircled by an animated pulsing aura utilizing opacity-attenuated `#087F68`.

### Status Badges & Chips
- Compact, high-visibility chips using `rounded-full`, padding `4px 10px`, typography `label-sm`.
- **CLEAR / COMPLETED**: Background `#EAF7F1`, text `#107E3E`, border `1px solid #A7F3D0`.
- **REVIEW**: Background `#FEF3C7`, text `#B45309`, border `1px solid #FDE68A`.
- **BLOCKED / FAILED**: Background `#FEE2E2`, text `#DC2626`, border `1px solid #FECACA`.
- **PAY_CONFIRMED / Pending**: Background `#EFF6FF`, text `#1D4ED8`, border `1px solid #BFDBFE`.
- **CANCELLED**: Background `#F3F4F6`, text `#6B7280`, border `1px solid #E5E7EB`.
- **UNKNOWN**: Background `#F3E8FF`, text `#7E22CE`, border `1px solid #E9D5FF`.

### Cards & Payment Surfaces
- Background `#FFFFFF`, border `1px solid #DFE5E8`, border-radius `16px`, padding `1.5rem`.
- Header houses transaction status chip top-right and counterpart payee avatar top-left.
- Inner data segments employ a subtle horizontal divider (`1px solid #F7F8FA`).

### Input Fields
- Minimum height `44px`, corner radius `10px`, background `#FFFFFF`, border `1px solid #DFE5E8`, padding `0 0.875rem`. Text `body-md` in `#15232D`.
- Focus state: Border color `#087F68` with box-shadow `0 0 0 3px #EAF7F1`.
- Technical inputs (Merchant ID, Client Secret, Webhook URI) use `code-md` typography.

### Checkboxes & Radio Controls
- Minimum dimensions `20px x 20px` housed within a `44px` touch region. Corner radius `4px` for checkboxes, `50%` for radios.
- Unchecked: Border `1.5px solid #DFE5E8`, background `#FFFFFF`.
- Checked: Background `#087F68`, border color `#087F68`, icon checkmark pure white.

### Voice Transcription Stream (Product-Specific)
- Background `#F7F8FA`, border `1px solid #DFE5E8`, border-radius `12px`, padding `1rem`.
- Features real-time audio wave visualization in `#087F68` and streaming speech text updating with confident entity tagging.