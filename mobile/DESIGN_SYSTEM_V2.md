# Premika 2.0 Design System Specification

> **Version**: 2.0.0 (Phase UI-1 Foundation)  
> **Target**: Premika Mobile (`mobile/`)  
> **Philosophy**: Premium Fashion Brand + Editorial Commerce + Apple-Native iOS + Liquid Glass Chrome + Rich Product Discovery

---

## 1. Brand Philosophy & Aesthetic Strategy

Premika 2.0 is an editorial, luxury Indian ethnic fashion mobile experience that unites Apple's modern Human Interface Guidelines (HIG) with warm, culturally resonant brand elegance.

### Core Tenets:
1. **Editorial Fashion Canvas**: Soft neutral surfaces (`#F8F6F4` / `#FFFFFF`) dominate the interface so high-fashion portrait photography remains the hero.
2. **Strategic Brand Accents**: Signature Royal Maroon (`#78201E`), Terracotta (`#92574A`), and Peach (`#FDE3CE`) are applied with discipline to primary CTAs, selected states, and critical commerce actions — never plastered across every surface.
3. **Apple Native Platform Layer**: Hardware blur materials, native large titles, native sheets (`formSheet` / `pageSheet`), SF Symbols, edge-swipe gestures, and fluid spring physics provide an unmistakable iOS feel.
4. **Liquid Glass Chrome**: Glass translucency is reserved for system navigation, floating bottom commerce bars, and contextual utility pills — never used on static product cards or catalog grids.
5. **Restrained Quiet Details**: Hairline borders, soft ambient light elevations, and consistent 4pt/8pt spacing create a calm, uncluttered, and efficient shopping atmosphere.

---

## 2. Semantic Color Tokens

Colors are exposed via `useTheme().colors` and support balanced Light and Dark modes.

### Brand Palette
| Token | Light Value | Dark Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `brandPrimary` / `primary` | `#78201E` | `#E06B68` | Primary brand color, main CTAs, active highlights |
| `primaryForeground` | `#FFFFFF` | `#120C0C` | High-contrast label color on primary surfaces |
| `brandSecondary` / `secondary` | `#92574A` | `#B5786B` | Terracotta secondary accent, supportive CTAs |
| `secondaryForeground` | `#FFFFFF` | `#120C0C` | High-contrast label color on secondary surfaces |
| `brandAccent` / `accent` | `#FDE3CE` | `#3D2523` | Warm peach container tint, soft badges |
| `accentForeground` | `#351B1A` | `#FDE3CE` | Contrast text on accent surfaces |
| `tint` | `#78201E` | `#E06B68` | Active navigation tint, switch controls |

### Backgrounds & Surfaces
| Token | Light Value | Dark Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `background` | `#F8F6F4` | `#120C0C` | Primary screen canvas (Warm porcelain / Espresso) |
| `backgroundSecondary`| `#F2EDE9` | `#1A1212` | Inset grouped list backgrounds |
| `backgroundTertiary` | `#EAE2DC` | `#241A1A` | Deep contrast background wells |
| `surface` | `#FFFFFF` | `#1E1616` | Standard cards, sheets, headers |
| `surfaceSecondary` | `#F8F6F4` | `#261D1D` | Secondary grouped cells |
| `surfaceElevated` | `#FFFFFF` | `#2E2323` | Floating cards, modal content surfaces |
| `surfaceMuted` | `#F4EFEA` | `#241A1A` | Subdued content wells |
| `surfaceTranslucent`| `rgba(255,255,255,0.88)` | `rgba(30,22,22,0.88)` | Fallback translucent surfaces |

### Typography Labels
| Token | Light Value | Dark Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `textPrimary` | `#1C1515` | `#FAF5F3` | Dominant titles, headings, prices |
| `textSecondary` | `#635352` | `#C5B5B3` | Subtitles, product descriptions, secondary meta |
| `textTertiary` | `#8E7D7B` | `#A69593` | Category tags, timestamps, breadcrumbs |
| `textMuted` | `#948382` | `#8E7D7B` | Inactive icons, placeholder inputs |
| `textQuaternary` | `#B8A8A6` | `#635352` | Disabled hints, subtle captions |
| `textInverse` | `#FFFFFF` | `#120C0C` | Text overlaid on inverted or dark hero banners |

### Borders & Separators
| Token | Light Value | Dark Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `border` | `#E8DDD6` | `#3D2C2A` | Standard card and cell outlines |
| `borderStrong` | `#D6C5BC` | `#523C3A` | Emphasized card boundaries, focused states |
| `borderSubtle` | `#F1E8E2` | `#2A1E1D` | Faint divider rules |
| `borderFocus` | `#78201E` | `#E06B68` | Active input and selection focus ring |
| `separator` | `#E8DDD6` | `#3D2C2A` | Inset list item separators |

### Status & Commerce Signals
| Token | Light Value | Dark Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `success` | `#16A34A` | `#22C55E` | Order confirmed, in-stock badge |
| `warning` | `#D97706` | `#F59E0B` | Low stock alert, delivery caution |
| `error` | `#DC2626` | `#EF4444` | Out-of-stock tag, payment error, destructive CTA |
| `info` | `#2563EB` | `#3B82F6` | Informational announcements |
| `sale` / `discount` | `#C22824` | `#F87171` | Discount pills, promotional offers |
| `newArrival` | `#B5786B` | `#D49B8E` | New collection tag |
| `featured` | `#78201E` | `#E06B68` | Curated drop badge |

---

## 3. Typography Hierarchy

Premika 2.0 adopts the native Apple San Francisco type scale (`typography.*`), augmented with dedicated product commerce and control variants.

### Apple HIG System Hierarchy
- `display`: `40pt` / `48pt` Line Height / Bold (Lookbook hero titles)
- `largeTitle`: `34pt` / `41pt` Line Height / Bold (Native navigation large headers)
- `title1`: `28pt` / `34pt` Line Height / Bold (Screen main titles)
- `title2`: `22pt` / `28pt` Line Height / Bold (Section titles, sheet headings)
- `title3`: `20pt` / `25pt` Line Height / SemiBold (Group titles, rail titles)
- `headline`: `17pt` / `22pt` Line Height / SemiBold (Card titles, modal titles)
- `body`: `17pt` / `22pt` Line Height / Regular (Primary body paragraphs)
- `bodyMedium`: `15pt` / `20pt` Line Height / Regular (Standard text, list rows)
- `bodySmall`: `13pt` / `18pt` Line Height / Regular (Captions, footnotes)
- `callout`: `16pt` / `21pt` Line Height / Regular (Action text)
- `subheadline`: `15pt` / `20pt` Line Height / Regular (Secondary descriptions)
- `footnote`: `13pt` / `18pt` Line Height / Regular (Legal disclosures, timestamps)
- `caption1`: `12pt` / `16pt` Line Height / Regular (Micro labels)
- `caption2`: `11pt` / `13pt` Line Height / Regular (Smallest badge text)

### Product Commerce Hierarchy
- `productName`: `15pt` / `20pt` Line Height / SemiBold (1-2 line catalog title)
- `productNameDetail`: `22pt` / `28pt` Line Height / Bold (PDP main product name)
- `productCategory`: `12pt` / `16pt` Line Height / Medium / Uppercase (Collection category)
- `priceLarge`: `24pt` / `30pt` Line Height / Bold (PDP selling price)
- `priceMedium`: `17pt` / `22pt` Line Height / Bold (Card selling price)
- `priceSmall`: `14pt` / `18pt` Line Height / Bold (Cart item price)
- `originalPrice`: `13pt` / `18pt` Line Height / Regular / Line-Through (Strikethrough price)
- `discountBadge`: `10pt` / `12pt` Line Height / Bold / Uppercase (`% OFF` tag)
- `stockBadge`: `10pt` / `12pt` Line Height / Bold / Uppercase (`IN STOCK` / `OUT OF STOCK`)
- `productMeta`: `13pt` / `18pt` Line Height / Regular (Fabric & fit metadata)
- `productDescription`: `15pt` / `22pt` Line Height / Regular (Editorial product narrative)

### Control & Navigation Hierarchy
- `buttonLarge`: `17pt` / `22pt` Line Height / Bold (Primary 56pt CTAs)
- `buttonMedium`: `15pt` / `20pt` Line Height / SemiBold (Standard 48pt buttons)
- `buttonSmall`: `13pt` / `16pt` Line Height / SemiBold (Compact 36pt actions)
- `chip`: `13pt` / `16pt` Line Height / Medium (Filter chips, size pickers)
- `chipSelected`: `13pt` / `16pt` Line Height / Bold (Selected filter state)
- `navigationTitle`: `17pt` / `22pt` Line Height / SemiBold (Centered navigation title)
- `sectionHeader`: `20pt` / `25pt` Line Height / Bold (Rail & section headers)
- `sectionSubtitle`: `13pt` / `18pt` Line Height / Regular (Section description)

---

## 4. Spacing Scale (4pt / 8pt Grid)

| Token | Value (pt) | Semantic Use |
| :--- | :--- | :--- |
| `none` | `0` | Reset |
| `xxs` | `2` | Faint micro adjustments, indicator margins |
| `xs` | `4` | Icon spacing, badge padding, chip spacing |
| `sm` | `8` | Item gaps, compact padding, chip vertical padding |
| `md` | `12` | Inner card padding, list row spacing, input internal padding |
| `lg` | `16` | Standard screen margin (`page`), card padding, gutter |
| `xl` | `20` | Section spacing, modal margins |
| `xxl` | `24` | Section gap, large container spacing |
| `xxxl` | `32` | Major section breaks |
| `huge` | `40` | Hero section margins |
| `giant` | `48` | Empty state spacing |
| `massive` | `64` | Hero landing spacing |

### Semantic Layout Spacing
- `page`: `16pt`
- `pageGutter`: `16pt`
- `card`: `16pt`
- `cardInner`: `12pt`
- `section`: `24pt`
- `sectionHeader`: `12pt`
- `railItemGap`: `12pt`
- `railPadding`: `16pt`
- `gridGutter`: `12pt`
- `headerHeight`: `44pt`
- `tabBarHeight`: `50pt`
- `bottomBarHeight`: `76pt`

---

## 5. Radius Geometry

Continuous Apple-style corner radii (`radius.*`):
- `none`: `0`
- `xs`: `4pt`
- `sm`: `8pt`
- `md`: `12pt`
- `lg`: `16pt`
- `xl`: `20pt`
- `xxl`: `24pt`
- `pill` / `full`: `9999pt`

### Semantic Component Radii
- `productImage`: `16pt` (Matches luxury lookbook proportions)
- `card`: `16pt`
- `cardLarge`: `20pt`
- `sheet`: `24pt` (Top corners of bottom sheets)
- `modal`: `20pt`
- `floating`: `24pt` (Floating action bar pill)
- `button`: `12pt`
- `buttonSmall`: `8pt`
- `input`: `12pt`
- `chip`: `9999pt` (Pill geometry)
- `badge`: `6pt`
- `avatar`: `9999pt`

---

## 6. Border System

Restrained hairline borders (`borders.*`):
- `BORDER_WIDTH.hairline`: `StyleSheet.hairlineWidth` (0.5pt on Retina)
- `BORDER_WIDTH.thin`: `1pt`
- `BORDER_WIDTH.medium`: `1.5pt`
- `BORDER_WIDTH.thick`: `2pt`

### Style Presets
- `BORDERS.separator`: `borderBottomWidth: hairline`
- `BORDERS.subtle`: `borderWidth: hairline`
- `BORDERS.card`: `borderWidth: hairline`
- `BORDERS.control`: `borderWidth: 1`
- `BORDERS.focus`: `borderWidth: 1.5`
- `BORDERS.selected`: `borderWidth: 1.5`

---

## 7. Ambient Depth & Shadow System

Soft, restrained elevations (`shadows.*`):
- `none`: Flat elevation
- `subtle`: Cards and cells (`shadowRadius: 3`, `opacity: 0.04`)
- `card`: Standard product and hero cards (`shadowRadius: 6`, `opacity: 0.05`)
- `medium`: Dropdown menus and elevated popovers (`shadowRadius: 10`, `opacity: 0.07`)
- `floating`: Floating bottom purchase bar (`shadowRadius: 16`, `opacity: 0.10`)
- `sheet`: Native bottom sheet top elevation (`shadowRadius: 18`, `opacity: 0.10`)
- `modal`: Full-screen dialogs (`shadowRadius: 24`, `opacity: 0.14`)
- `glass`: Liquid glass containers (`shadowRadius: 12`, `opacity: 0.06`)

---

## 8. Material Hierarchy & Liquid Glass Rules

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SYSTEM LIQUID GLASS                                      │
│    - Native iOS tab bar (Liquid Glass Fabric)               │
│    - Native navigation bar & large title chrome             │
│    - Native formSheet presentation surfaces                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. SECONDARY GLASS OVERLAYS                                 │
│    - Sticky bottom commerce purchase bar                    │
│    - Contextual floating action pills                       │
│    - Image gallery floating heart button                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SOLID CONTENT SURFACES (Dominant Canvas)                 │
│    - Product cards & category visual modules                │
│    - Product imagery (Never blurred)                        │
│    - Editorial description boxes & price blocks             │
└─────────────────────────────────────────────────────────────┘
```

### Explicit Liquid Glass Rules:
- **GLASS IS FOR**: Navigation chrome, floating bottom bars, contextual overlay actions, sheet handles/backdrops, compact utility pills.
- **GLASS IS NOT FOR**: Catalog product cards, category cards, product imagery, screen backgrounds, dense list rows.
- **Android / Low-Power**: Automatically renders high-performance translucent solid fallback (`androidFallback.lightBg: rgba(255,255,255,0.94)` / `darkBg: rgba(24,18,18,0.95)`).

---

## 9. Product Media Canonical Tokens

Aspect ratios (`media.*` / `MEDIA_ASPECT_RATIOS`):
- `productPortrait`: `0.78` (4:5 / High-fashion portrait lookbook)
- `productSquare`: `1.0` (1:1 Square catalog)
- `heroPortrait`: `1.1` (Edge-to-edge PDP gallery)
- `heroWide`: `2.2` (Home banner carousel)
- `categoryPortrait`: `0.9`
- `categorySquare`: `1.0`
- `categoryHorizontal`: `1.1`
- `gallery`: `1.1`
- `thumbnail`: `0.8` (Cart/checkout compact preview)

---

## 10. Motion & Press Interaction System

Driven by `react-native-reanimated` with Apple-calibrated spring physics (`motion.*`):

### Spring Physics Presets
- `SPRING.snappy`: `damping: 20`, `stiffness: 300`, `mass: 0.8` (Button presses, chip toggles)
- `SPRING.standard`: `damping: 18`, `stiffness: 220`, `mass: 1` (Sheet expansion, card expands)
- `SPRING.gentle`: `damping: 25`, `stiffness: 120`, `mass: 1` (Subtle layout shifts, toast entrances)
- `SPRING.bouncy`: `damping: 12`, `stiffness: 180`, `mass: 0.8` (Delight celebrations, badge pops)
- `SPRING.sheet`: `damping: 22`, `stiffness: 240`, `mass: 1` (Modal drag-to-dismiss)

### Press Interaction Scales (`PRESS_SCALE.*`)
- `primaryButton`: `0.97`
- `secondaryButton`: `0.97`
- `icon`: `0.92`
- `card`: `0.98`
- `chip`: `0.96`
- `wishlist`: `0.88`
- `subtle`: `0.99`

### Reduced Motion Support
- Helper functions `getAccessibleSpring()` and `getAccessiblePressScale()` automatically damp or eliminate spring travel when system reduced motion is enabled.

---

## 11. Semantic Haptic System

Centralized via `haptic.*` in [`haptics.ts`](file:///Users/xeoren/premika-static-main/mobile/src/utils/haptics.ts):
- `haptic.light()` / `haptic.lightImpact()`: Chips, filter toggles, tab switches
- `haptic.medium()` / `haptic.mediumImpact()`: Add to Cart, Buy Now, Save Address, Place Order
- `haptic.heavy()` / `haptic.heavyImpact()`: Delete item, sign out confirmation
- `haptic.selection()`: Size selector, height chip, variant picker
- `haptic.success()`: Order placed, coupon applied, profile updated
- `haptic.warning()`: Coupon invalid, field incomplete
- `haptic.error()`: Network failure, payment declined
- `haptic.trigger(intent)`: Dynamic dispatch by intent name

---

## 12. Layout Primitives

Exported from `src/components/layout/`:
- `<ScreenContainer>`: SafeArea-aware page wrapper with automatic bottom tab bar insets.
- `<Section>`: Standardized vertical section separator with semantic margins.
- `<SectionHeader>`: Title, subtitle, optional left icon, and "See All" chevron action.
- `<HorizontalRail>`: Smooth horizontal scrolling carousel with standardized rail padding and item gaps.
- `<ProductGridContainer>`: 2-column fashion storefront grid wrapper.
- `<FloatingActionContainer>`: Sticky bottom Liquid Glass bar for purchase CTAs.

---

## 13. Accessibility & Performance Discipline

1. **Touch Targets**: Minimum `44pt` bounding box on all interactive controls (`TOUCH_TARGETS.minimum`).
2. **Hit Slop**: Standardized hit slops (`small: 8pt`, `medium: 12pt`, `large: 16pt`) on icon buttons.
3. **Contrast**: WCAG AAA/AA compliant text contrast across Light and Dark themes.
4. **Performance Rules**:
   - Never nest multiple `BlurView` instances.
   - Use static solid surfaces for dense scrolling catalog grids.
   - Memoize card items with `React.memo` and `getItemLayout` where appropriate.
   - Retain native iOS Liquid Glass system chrome.
