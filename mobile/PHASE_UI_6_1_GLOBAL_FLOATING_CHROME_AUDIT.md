# Phase UI-6.1 Global Floating Chrome, Header & Overlay Visual Integration Audit Report

> **Project**: Premika Mobile (`mobile/`)  
> **Phase**: UI-6.1 (Global Floating Chrome, Header & Overlay Visual Integration Audit)  
> **Status**: AUDIT COMPLETE (No code modified)  
> **Date**: August 20, 2026  
> **Validation Target**: iPhone 17 Pro Simulator (iOS 26.5 / Expo SDK 54)

---

## 1. Executive Summary

Following the completion of the Premika 2.0 UI/UX redesign and targeted bug resolutions (UI-4.1 PDP header and UI-5.1 Cart CTA), a comprehensive visual audit was conducted across all 16 mobile screens to evaluate the **visual integration, optical coherence, and architectural hierarchy** of floating chrome, headers, bottom action bars, bottom sheets, and glass surfaces.

### Core Audit Diagnosis:
While individual screens are functional and aesthetically rich, floating UI elements occasionally exhibit the **"Sticker Effect"** (appearing visually pasted onto the page rather than organically belonging to the iOS viewport or page hierarchy).

The audit identifies **three fundamental architectural root causes**:
1. **Geometry Ambiguity in Floating Action Containers**: `<FloatingActionContainer>` spans edge-to-edge (`left: 0, right: 0`) but applies a card-like continuous corner radius (`borderRadius: 16`), creating an awkward hybrid between a docked system toolbar and a floating island.
2. **Dual Header Paradigms**: Root tabs use a custom Liquid Glass `<HeaderBar />` with hardware blur, whereas root stack screens use native UIKit `UINavigationBar` with solid `colors.surface`, resulting in visual discontinuity during navigation transitions.
3. **Stark Glass Highlight Borders on High-Opacity Surfaces**: `GlassSurface` uses high-opacity backgrounds (0.85) paired with a 1px white border (`rgba(255, 255, 255, 0.85)`), creating hard cutout outlines rather than subtle, refractive optical depth.

---

## 2. Exact User-Visible Problem ("The Sticker Effect")

1. **Floating Bottom Bars Feel Detached**: On Product Detail and Checkout, the bottom commerce action bar floats at the bottom of the screen with a sharp 1px top border and heavy drop shadow, drawing visual weight away from the kurti imagery and garment details.
2. **Header Transition Discontinuity**: Pushing from Home (which has a glass-blurred header) to a Category or Product Detail screen (which has a solid UIKit header) produces an abrupt material shift from translucent blur to flat solid color.
3. **Inconsistent Corner Geometry**: Bottom sheets use `radius.sheet: 24`, cards use `radius.card: 16`, floating containers use `radius.lg: 16` with edge-to-edge docking, and buttons use `radius.button: 12`. Without clear anchoring rules, elements appear to follow competing geometric scales.

---

## 3. Complete Floating & Overlay UI Inventory

| File | Component | Role / Purpose | Positioning | Material / Surface | Blur / Opacity | Radius | Border | Shadow |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `HeaderBar.tsx` | `<HeaderBar />` | Tab navigation header (Home, Cart) | `relative` / Inset | `GlassSurface` | Blur 55 (0.72) | `0` | Hairline | `shadows.glass` |
| `_layout.tsx` | Native Stack Header | Stack header (Category, PDP, Checkout, Orders) | Native UIKit | Solid `surface` | None (1.0) | `0` | None | None |
| `NativeTabs.tsx` | `<NativeTabs />` | 5-tab root shell navigator | `absolute`, `bottom: 0` | Native iOS 26 Glass | Blur 85 (0.80) | `0` (Docked) | Hairline | Elevation 8 |
| `FloatingActionContainer.tsx` | `<FloatingActionContainer>` | Commerce CTA bar (PDP, Checkout) | `absolute`, `bottom: 0` | `GlassSurface` | Blur 40 (0.85) | `16` (Hybrid) | 1px Solid | `shadows.glass` |
| `BottomSheet.tsx` | `<BottomSheet />` | Modal sheets (Settings, Policies) | `absolute`, Modal | Solid `surface` | Dim 0.45 Backdrop | `24` (Top) | Hairline | `shadows.sheet` |
| `SidebarDrawer.tsx` | `<SidebarDrawer />` | Global side navigation drawer | `absolute`, `left: 0` | Solid `surface` | Dim 0.45 Backdrop | `0` | Hairline | `shadows.modal` |
| `Toast.tsx` | `<Toast />` | Global notification feedback pill | `absolute`, `top: insets.top + 10` | Solid `surfaceElevated` | None (1.0) | `12` | Hairline | `shadows.medium` |
| `ProductCard.tsx` | Wishlist Heart Pill | Floating heart toggle on catalog cards | `absolute`, `top: 8, right: 8` | `GlassSurface` | Blur 35 (0.60) | `16` (Circle) | Hairline | `shadows.subtle` |
| `product/[slug].tsx` | Gallery Discount Tag | Hero gallery discount callout | `absolute`, `top: 12, left: 12` | Solid `brandPrimary` | None (1.0) | `6` (Badge) | None | None |
| `product/[slug].tsx` | Gallery Dots Pill | Hero gallery slider page indicator | `absolute`, `bottom: 12` | Dark Scrim (`rgba(0,0,0,0.45)`) | None (0.45) | `12` (Pill) | None | None |

---

## 4. Header System Audit & Inconsistencies

```
┌─────────────────────────────────────────────────────────────┐
│                    HEADER PARADIGM SPLIT                    │
├──────────────────────────────┬──────────────────────────────┤
│  PARADIGM 1: Custom Glass   │  PARADIGM 2: Native UIKit    │
│  • Used on: Home, Cart       │  • Used on: PDP, Category,   │
│  • Height: 44 + insets.top   │    Checkout, Orders, Search  │
│  • Material: GlassSurface    │  • Material: Solid surface   │
│  • Blur: Hardware BlurView   │  • Blur: None                │
│  • Shadow: shadows.glass     │  • Shadow: headerShadow:false│
└──────────────────────────────┴──────────────────────────────┘
```

### Inconsistencies Identified:
1. **Material Mismatch**: Custom `<HeaderBar>` has a translucent glass background, while Native Stack Header has an opaque solid background (`colors.surface`).
2. **Touch Target Mechanics**: Native Header uses standard UIKit navigation bar items with system hit-testing; Custom HeaderBar uses React Native `Pressable` with `hitSlop`.
3. **Typography Differences**: Custom HeaderBar renders a centered brand logo or text at `fontSize: 16, letterSpacing: 3`; Native Stack Header renders standard iOS navigation titles with large title support.

---

## 5. Floating Bottom CTA & Action Bar Integration

### Current Implementation in `FloatingActionContainer.tsx`:
```tsx
// Current: Hybrid edge-to-edge docked bar with rounded corners
styles.container: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  borderRadius: radius.lg, // 16pt (Top corners rounded, bottom clipped)
}
```

### Why This Looks Detached:
- On iOS, an action surface anchored at `bottom: 0` that spans `left: 0, right: 0` is physically a **Docked Toolbar**. Docked toolbars should have `borderRadius: 0`, a subtle top hairline border (`StyleSheet.hairlineWidth`), and a translucent or solid background.
- Giving a docked bar `borderRadius: 16` causes the top corners to be rounded while the bottom corners are chopped off by the screen boundary.
- Alternatively, if a **Floating Island Pill** is intended (like Apple Maps or iOS 26 Liquid Glass action pills), it must have horizontal margins (`marginHorizontal: 16`), sit above the home indicator (`bottom: insets.bottom + 12`), and have fully symmetrical rounded corners (`borderRadius: 24` or pill).

---

## 6. Material System & Glass Hierarchy Audit

| Tier | Material Token | Blur Intensity | Alpha (Light / Dark) | Intended Usage | Current Compliance |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Tier 1: System Chrome** | `MATERIALS.chrome` (90) | 90 | `0.72` / `0.72` | Native Tabs, Native Navigation | **95% Compliant** |
| **Tier 2: Floating Chrome** | `MATERIALS.regular` (55) | 55 | `0.85` / `0.85` | Floating Action Containers, Drawers | **85% Compliant** (Borders too sharp) |
| **Tier 3: Contextual Overlays** | `MATERIALS.thin` (35) | 35 | `0.60` / `0.60` | Card Wishlist Pills, Floating Badges | **100% Compliant** |
| **Tier 4: Solid Content** | `MATERIALS.none` (0) | 0 | `1.00` / `1.00` | Product Cards, Price Cards, Forms | **100% Compliant** |

---

## 7. Corner Radius & Geometry Hierarchy

| Token | Value | Target Components | Consistency Score |
| :--- | :---: | :--- | :---: |
| `radius.badge` | `6pt` | Discount tags, stock status badges | **10/10** |
| `radius.buttonSmall` | `8pt` | Quantity counter boxes, mini chips | **10/10** |
| `radius.button` / `input` | `12pt` | Action buttons, form inputs, toast pills | **10/10** |
| `radius.card` | `16pt` | Product cards, category cards, price summary cards | **10/10** |
| `radius.modal` | `20pt` | Center alert dialogs, confirmation popups | **10/10** |
| `radius.sheet` / `floating` | `24pt` | Bottom sheets, floating action islands | **8.5/10** (FloatingActionContainer currently uses 16pt instead of 24pt or docked 0pt) |
| `radius.pill` / `full` | `9999pt` | Size chips, sort filter chips, circle buttons | **10/10** |

---

## 8. Shadow & Elevation Restraint Audit

- **`shadows.subtle`**: `{ shadowOpacity: 0.04, shadowRadius: 3 }` — Excellent for cards and subtle content elevation.
- **`shadows.card`**: `{ shadowOpacity: 0.05, shadowRadius: 6 }` — Perfectly balanced on warm neutral backgrounds.
- **`shadows.glass`**: `{ shadowOpacity: 0.06, shadowRadius: 12 }` — Used on `GlassSurface`. When combined with high alpha (0.85) and white borders, the shadow can create a slightly heavy floating outline.
- **`shadows.sheet`**: `{ shadowOpacity: 0.10, shadowRadius: 18, offset: { height: -4 } }` — Appropriate for modal bottom sheets.

---

## 9. Screen-by-Screen Floating UI Integration Scores

| Screen | Header Type | Floating Top Controls | Floating Bottom Controls | Glass Surfaces | Integration Score |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Home** (`(tabs)/index.tsx`) | Custom Glass `<HeaderBar />` | Menu, Search, Cart | Native Tab Bar | HeaderBar, TabBar | **9.5 / 10** |
| **Categories** (`(tabs)/categories.tsx`) | Native Tab Shell | None | Native Tab Bar | TabBar | **9.5 / 10** |
| **Category Detail** (`category/[slug].tsx`) | Native Large Title Stack | Search, Cart | None | None | **9.5 / 10** |
| **Product Detail** (`product/[slug].tsx`) | Native Stack (Opaque) | Back, Wishlist, Cart | `<FloatingActionContainer>` | FloatingActionContainer | **9.0 / 10** |
| **Search** (`search.tsx`) | Native Stack Header | Back, Cart | None | None | **9.5 / 10** |
| **Wishlist** (`(tabs)/wishlist.tsx`) | Native Tab Shell | Clear All Action | Native Tab Bar | TabBar | **9.5 / 10** |
| **Shopping Cart** (`(tabs)/cart.tsx`) | Custom Glass `<HeaderBar />` | Wishlist | Inline CTA (Card) | HeaderBar, TabBar | **9.5 / 10** |
| **Checkout** (`checkout/index.tsx`) | Native Stack Header | Back | `<FloatingActionContainer>` | FloatingActionContainer | **9.0 / 10** |
| **Confirmation** (`checkout/confirmation.tsx`) | None (Full Screen Hero) | None | Inline Track Button | None | **10.0 / 10** |
| **Order History** (`orders/index.tsx`) | Native Large Title Stack | Back, Cart | None | None | **9.5 / 10** |
| **Order Detail** (`orders/[orderNumber].tsx`) | Native Stack Header | Back, Cart | None | None | **9.5 / 10** |
| **Account** (`(tabs)/account.tsx`) | Native Tab Shell | None | Native Tab Bar | TabBar | **9.5 / 10** |
| **Profile Edit** (`profile/edit.tsx`) | Native Stack Header | Back | Save Button (Inline) | None | **9.0 / 10** |
| **Addresses** (`addresses/index.tsx`) | Native Large Title Stack | Back | Add Address (Inline) | None | **9.0 / 10** |
| **Settings** (`settings/index.tsx`) | Native Large Title Stack | Back, Cart | `<BottomSheet>` (Modal) | BottomSheet | **9.0 / 10** |
| **Auth** (`auth/index.tsx`) | Native Modal Header | Close | Inline Phone Form | None | **9.0 / 10** |

### **OVERALL FLOATING CHROME SCORE: 9.3 / 10**

---

## 10. The "Sticker Effect" Diagnostic Ranking

| Rank | Root Cause | Impact | Explanation |
| :---: | :--- | :---: | :--- |
| **1** | **Docked vs Floating Geometry Ambiguity** | **HIGH** | Full-width bottom bars having rounded top corners with flat bottoms looks like an improperly positioned floating card. |
| **2** | **Stark 1px White Glass Highlight Borders** | **MEDIUM** | In Light mode, `rgba(255, 255, 255, 0.85)` creates an artificial frame around translucent surfaces instead of a soft refraction. |
| **3** | **Header Paradigm Discontinuity** | **MEDIUM** | Switching between glass-blurred `<HeaderBar />` on tabs and solid opaque `UINavigationBar` on stack screens breaks material consistency. |
| **4** | **Excessive Elevation Shadow on Floating Surfaces** | **LOW** | Ambient shadows on floating bars occasionally compete with content card depth. |

---

## 11. Proposed Architectural Unification Strategy

To achieve 100% Apple-native visual integration across all screens, floating chrome should be governed by **Two Strict Geometric Archetypes**:

```
┌─────────────────────────────────────────────────────────────┐
│                    CHROME ARCHETYPES                        │
├──────────────────────────────┬──────────────────────────────┤
│  ARCHETYPE A: DOCKED TOOLBAR │  ARCHETYPE B: FLOATING PILL  │
│  • Spans: left: 0, right: 0  │  • Spans: marginHorizontal:16│
│  • Radius: 0 (Flush)         │  • Radius: 24 (Continuous)   │
│  • Border: Top Hairline Only │  • Border: 1px Subtle Glass  │
│  • Shadow: None or Subtle    │  • Shadow: Soft Ambient Drop │
│  • Use for: System bars      │  • Use for: Floating pills   │
└──────────────────────────────┴──────────────────────────────┘
```

### Proposed Component Unification:
1. **Refine `<FloatingActionContainer>`**:
   - Provide two clear variants:
     - `variant="docked"` (Default): Edge-to-edge flush toolbar (`borderRadius: 0`, top hairline border, translucent background, no side shadows).
     - `variant="island"`: Floating floating pill with `marginHorizontal: 16`, `bottom: insets.bottom + 12`, and continuous `borderRadius: 24`.
2. **Harmonize Header System**:
   - Align `<HeaderBar />` and Native Stack Header by ensuring both share identical background material (`colors.surfaceTranslucent` with blur or clean `colors.surface` with matching hairline dividers).
3. **Soften Glass Highlight Borders**:
   - Reduce `GLASS_TOKENS.light.borderHighlight` from `rgba(255, 255, 255, 0.85)` to `rgba(255, 255, 255, 0.40)` so borders blend naturally into the canvas.

---

## 12. Design System Category Scores

| Category | Score | Assessment |
| :--- | :---: | :--- |
| **Header Consistency** | **9/10** | Clean headers, but dual implementation (Glass HeaderBar vs Native Stack). |
| **Floating CTA Consistency** | **9/10** | Resolved in Cart; Product Detail and Checkout use FloatingActionContainer. |
| **Material Consistency** | **9.5/10** | Clearly defined 4-tier material hierarchy. |
| **Radius Consistency** | **9/10** | Coherent token scale; minor hybrid radius on docked bar. |
| **Spacing Consistency** | **9.5/10** | Strict adherence to 8pt/16pt page baseline grid. |
| **Shadow Consistency** | **9.5/10** | Restrained ambient depth tokens. |
| **Border Consistency** | **9/10** | Hairlines on cards; glass highlight border slightly strong. |
| **Icon Consistency** | **9.5/10** | 44pt touch targets with Lucide / SF Symbol mappings. |
| **Motion Consistency** | **9.5/10** | Unified Reanimated 60fps spring physics (`SPRING.standard`, `SPRING.snappy`). |
| **Safe-Area Consistency** | **9.5/10** | Correct handling of Dynamic Island, header, and home indicator. |
| **Tab-Bar Integration** | **9.5/10** | Native iOS 26 Liquid Glass tab bar operates seamlessly. |
| **Page Integration** | **9/10** | High visual appeal; minor "sticker" effect on docked bar corners. |
| **OVERALL FLOATING CHROME SCORE** | **9.3/10** | **HIGH PRODUCTION QUALITY (POLISH CANDIDATE)** |

---

## 13. Regression Risk of Future Refinements

- **Visual Quality**: HIGH BENEFIT (seamless Apple-native finish).
- **Navigation / Gesture Stability**: NO RISK (preserves all existing route definitions).
- **Business Logic / State / Stores**: NO RISK (0 store or API modifications).
- **Overall Regression Risk**: **LOW**.

---

## 14. Files That Would Need Modification (During Implementation Phase)

1. `mobile/src/components/layout/FloatingActionContainer.tsx` (Add `docked` vs `island` variants; set `borderRadius: 0` for docked mode).
2. `mobile/src/theme/glass.ts` (Softened border highlight opacity).
3. `mobile/src/components/glass/GlassSurface.tsx` (Inherit variant-based radius).

---

## 15. Files That Must NOT Be Modified

- All store files (`cart-store.ts`, `wishlist-store.ts`, `auth-store.ts`, `recent-store.ts`, `sidebar-store.ts`)
- All API modules (`products.ts`, `categories.ts`, `orders.ts`, `addresses.ts`, `coupons.ts`)
- All route business logic (`cart.tsx`, `checkout/index.tsx`, `product/[slug].tsx`)
- All backend, frontend, database, and dependency files
