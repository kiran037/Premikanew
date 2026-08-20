# Phase UI-6.2 Product Detail Floating Bar & Main Header Material/Blend Audit Report

> **Project**: Premika Mobile (`mobile/`)  
> **Phase**: UI-6.2 (Material, Color Blend & Visual Blend Audit)  
> **Status**: AUDIT COMPLETE (No code modified)  
> **Date**: August 20, 2026  
> **Validation Target**: iPhone 17 Pro Simulator (iOS 26.5 / Expo SDK 54)

---

## 1. Executive Summary

This audit addresses a specific visual refinement defect identified in Premika 2.0:
- The **Product Detail Bottom Commerce Bar** and **Main Header (`HeaderBar.tsx`)** do not visually blend naturally with the underlying warm editorial surfaces.
- Both surfaces exhibit an overly prominent, cool/bluish-tinted, "frosted plastic/UI-like" appearance rather than a quiet, high-end luxury editorial canvas.
- The root cause is the interplay between Apple's native `BlurView` (`UIBlurEffectStyleLight`) and warm porcelain/ecru page backgrounds (`#F8F6F4`), coupled with an overly complex container styling that competes with the CTA buttons for visual dominance.

---

## 2. User-Visible Problem

1. **Cool/Bluish Frosted Artifact**: On screens with warm neutral backdrops (`#F8F6F4`), the hardware blur in `<GlassSurface>` refracts with a cool, bluish-white cast.
2. **Container Over-Emphasis**: The floating bottom bar draws visual weight away from the kurti photography and product details due to excessive glass density, milky opacity, and blur layers.
3. **Header Discontinuity**: The main tab-root header (`HeaderBar.tsx`) feels frosted and detached, contrasting sharply with the clean, solid native UIKit headers used on stack screens.

---

## 3. Product Detail Commerce Bar Architecture

```
<View style={styles.container}> (Screen Background: #F8F6F4)
  │
  └── <FloatingActionContainer variant="docked">
        │
        └── <GlassSurface variant="floating" borderRadius={0}>
              │
              ├── <BlurView intensity={40} tint="light" /> (Native UIBlurEffectStyleLight)
              │
              └── <View style={contentOverlay} backgroundColor="rgba(255,255,255,0.85)">
                    │
                    ├── Total Price Block: "Total Price" (caption1) + "₹X,XXX" (priceMedium)
                    │
                    └── CTA Group:
                          ├── [Add to Cart] (Button variant="outline", size="md")
                          └── [Buy Now] (Button variant="primary", size="md")
```

---

## 4. Exact Source of the "Blue / Tinted Glass" Effect

1. **Apple `UIBlurEffectStyleLight` Optical Refraction**:
   - `expo-blur`'s `<BlurView tint="light">` maps directly to UIKit's `UIBlurEffectStyleLight`.
   - Apple's native light blur engine uses a cool-white optical matrix (approximately 6500K color temperature) designed for macOS/iOS cool-gray system interfaces.
2. **Contrast with Premika's Warm Editorial Palette**:
   - Premika's background is **warm porcelain / ecru (`#F8F6F4`)** with subtle red/terracotta undertones.
   - When the cool 6500K blur is composited over the warm 3200K ecru background, the human eye perceives a noticeable **cool/bluish-tinted cast**.
3. **Milky White Overlay (`rgba(255, 255, 255, 0.85)`)**:
   - The high-opacity white overlay layer traps the cool blur underneath, creating an opaque "frosted plastic" appearance.

---

## 5. Container vs Button Visual Hierarchy Analysis

| Element | Current Visual Treatment | Perceived Weight | Desired Editorial Role |
| :--- | :--- | :---: | :--- |
| **Commerce Container** | Heavy blur (intensity 40) + milky white overlay (0.85) + top divider | **TOO STRONG (45%)** | **Quiet Neutral Canvas (10%)** |
| **Price Label** | Total Price caption + Maroon price | **Balanced (15%)** | **Clean Informational Anchor (20%)** |
| **"Add to Cart"** | Maroon outline on glass | **Moderate (15%)** | **Refined Secondary Action (30%)** |
| **"Buy Now"** | Solid Maroon button | **Moderate (25%)** | **Primary Dominant Action (40%)** |

### Finding:
The container is currently treated as an ornate "glass object" that competes with the interactive actions. In premium luxury commerce (e.g. Net-A-Porter, Zara, Cos, Apple Store), the container is **visually silent**—letting the bold CTA buttons provide the visual energy.

---

## 6. Motion & Animation vs Material Polling

- The current implementation relies heavily on **static material blur** to simulate polish.
- `Button.tsx` already features calibrated **Reanimated 60fps spring physics** (`PRESS_SCALE: 0.98`, `SPRING.snappy: { damping: 20, stiffness: 220 }`).
- By quieting the container and letting the tactile spring animations of the buttons take center stage, the interface feels significantly more physical, responsive, and luxurious.

---

## 7. Product Image & Content Relationship

- Because Product Detail displays large fashion photography (`aspectRatio: 1.1`), having a cool, milky-blue bar docked at the bottom creates a jarring color clash with the rich earthy tones of kurtis and sarees.
- A neutral docked surface (`surfaceTranslucent: rgba(255, 255, 255, 0.94)` or solid `surface: #FFFFFF` with a crisp hairline divider) allows the garment photography to scroll smoothly behind the bar without color distortion.

---

## 8. Material Intensity Assessment

| Component | Current Material | Assessment | Recommended Refinement |
| :--- | :--- | :---: | :--- |
| **PDP Bottom Commerce Bar** | `GlassSurface` with blur 40 + alpha 0.85 | **TOO STRONG / COOL** | Quiet neutral translucent surface (`surfaceTranslucent`) with top hairline |
| **Main Header (`HeaderBar.tsx`)** | `GlassSurface` with blur 55 + alpha 0.72 | **TOO STRONG / COOL** | Clean neutral surface (`surfaceTranslucent` / `surface`) with bottom hairline |
| **Native Tab Bar** | Native iOS 26 Liquid Glass | **BALANCED** | Keep as system chrome |
| **Bottom Sheets** | Solid `surface` with backdrop dim | **BALANCED** | Keep as modal layer |

---

## 9. Main Header Audit (`mobile/src/components/common/HeaderBar.tsx`)

- **Current Implementation**:
  ```tsx
  <GlassSurface
    variant="navigation"
    showBorder
    style={[styles.header, { height: containerHeight, paddingTop: insets.top }]}
  >
  ```
- **Issue**: Renders a `BlurView` with `intensity: 55` over the Home storefront. When the New Arrivals banner and warm photography scroll under it, the top of the screen turns into a cool frosted band.
- **Contrast with Stack Screens**: Category, Order Detail, and Search use native UIKit navigation bars with clean solid backgrounds, creating an obvious visual split between tab-root and stack navigation.

---

## 10. Liquid Glass Philosophy: System Chrome vs Page Surface

```
┌─────────────────────────────────────────────────────────────┐
│                 PREMIKA 2.0 MATERIAL RULES                  │
├──────────────────────────────┬──────────────────────────────┤
│  SYSTEM CHROME (ALLOWED)     │  PAGE CHROME (QUIET NEUTRAL) │
│  • Native Bottom Tab Bar     │  • PDP Bottom Commerce Bar   │
│  • Global Sidebar Backdrop   │  • Main HeaderBar            │
│  • Modal Sheet Backdrops     │  • Product / Checkout CTAs   │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 11. Button-First Hierarchy Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  QUIET NEUTRAL DOCKED CONTAINER                             │
│  (Background: surfaceTranslucent #FFFFFF 94%, Top Hairline) │
├─────────────────────────────────────────────────────────────┤
│  [ Total: ₹2,499 ]  │  [ Add to Cart ]  │  [ BUY NOW ]      │
│  Clean Typography   │  Neutral Outline  │  Royal Maroon CTA │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Design Direction Comparison

### **OPTION A: Minimal Neutral (Recommended — Most Editorial & Premium)**
- **Description**: Replace the heavy `GlassSurface` / `BlurView` on the PDP bottom bar and `HeaderBar` with a **warm-neutral translucent surface** (`backgroundColor: colors.surfaceTranslucent`, `borderTopWidth: StyleSheet.hairlineWidth`, `borderTopColor: colors.borderSubtle`).
- **Visual Benefit**:
  - 100% eliminates the cool/blue frosted artifact.
  - Aligns perfectly with Premika's warm porcelain brand palette.
  - Matches the clean, solid sophistication of native iOS stack headers.
  - Lets the Royal Maroon "Buy Now" button stand out with maximum contrast.
- **Tradeoff**: Reduces hardware blur on the commerce bar in favor of clean, quiet editorial minimalism.
- **Risk**: **LOW (Zero navigation or layout regression)**.

---

### **OPTION B: Subtle Warm-Tinted Glass**
- **Description**: Keep `BlurView`, but reduce intensity to `15` and introduce a warm cream tint (`rgba(248, 246, 244, 0.90)`).
- **Visual Benefit**: Retains subtle blur without the harsh blue cast.
- **Tradeoff**: Requires custom color-tint math over native blur; can still exhibit slight optical distortion on older iOS devices.
- **Risk**: **MEDIUM**.

---

### **OPTION C: True Minimalist Floating Island**
- **Description**: Convert the commerce bar into a floating pill with `marginHorizontal: 16`, `borderRadius: 24`, and solid `surfaceElevated` background.
- **Visual Benefit**: Modern floating aesthetic.
- **Tradeoff**: Consumes more vertical content space and reduces button touch width.
- **Risk**: **MEDIUM**.

---

## 13. Recommended Direction: **OPTION A (Minimal Neutral / Button-First Hierarchy)**

### Summary of Recommended Architecture:
1. **Product Detail Commerce Bar**:
   - `FloatingActionContainer` renders as a **quiet, neutral docked canvas** (`backgroundColor: colors.surfaceTranslucent` / `rgba(255, 255, 255, 0.94)`, top hairline border `borderTopColor: colors.borderSubtle`).
   - Remove the cool `BlurView` from the commerce container so no bluish frosting occurs over garment photography.
2. **Main Header (`HeaderBar.tsx`)**:
   - Render a **clean neutral header** (`backgroundColor: colors.surfaceTranslucent`, bottom hairline border `borderBottomColor: colors.borderSubtle`).
   - Seamlessly harmonizes with the native UIKit stack headers across Category, PDP, and Search.
3. **CTA Buttons**:
   - "Add to Cart": Refined secondary action.
   - "Buy Now": High-contrast Royal Maroon primary action.

---

## 14. Scope of Changes (Targeted Component Level)

- **Targeted Scope**:
  1. `mobile/src/components/layout/FloatingActionContainer.tsx` (Use clean neutral surface for docked variant)
  2. `mobile/src/components/common/HeaderBar.tsx` (Use clean neutral surface with bottom hairline divider)
  3. `mobile/src/theme/colors.ts` / `mobile/src/theme/glass.ts` (Ensure `surfaceTranslucent` provides optimal warm opacity)

---

## 15. Regression Risk Assessment

- **Navigation & Gestures**: NO RISK (preserves all existing route handlers and stack options).
- **Safe Area & Insets**: NO RISK (preserves existing `insets.bottom` and `insets.top` calculations).
- **Dark Mode**: NO RISK (automatically maps `surfaceTranslucent: rgba(30, 22, 22, 0.92)` in Dark theme).
- **Overall Regression Risk**: **LOW**.

---

## 16. Files That Would Need Modification (During Implementation Phase)

1. `mobile/src/components/layout/FloatingActionContainer.tsx`
2. `mobile/src/components/common/HeaderBar.tsx`

---

## 17. Files That Must NOT Be Modified

- `mobile/src/navigation/NativeTabs.tsx` (Native tab bar is preserved as system chrome)
- `mobile/src/store/*` (0 changes)
- `mobile/src/api/*` (0 changes)
- `mobile/app/*` (0 screen-level route rewrites)
- `backend/*` (0 changes)
- `frontend/*` (0 changes)
