# Phase UI-5.1 Cart Bottom CTA, Tab Bar & Safe-Area Occlusion Audit Report

> **Project**: Premika Mobile (`mobile/`)  
> **Phase**: UI-5.1 (Diagnostic Cart Bottom CTA & Tab Bar Occlusion Audit)  
> **Status**: AUDIT COMPLETE (No code modified)  
> **Date**: August 20, 2026  
> **Validation Target**: iPhone 17 Pro Simulator (iOS 26.5 / Expo SDK 54)

---

## 1. Executive Summary

During native iOS testing on iPhone 17 Pro, a layout and hit-testing collision was identified on the **Shopping Cart Screen** (`mobile/app/(tabs)/cart.tsx`):
- The bottom checkout action container (`<FloatingActionContainer>`) is positioned at `position: 'absolute', bottom: 0`.
- Because `cart.tsx` is hosted inside the **Native Bottom Tab Navigator** (`NativeTabs`), the native iOS Liquid Glass Tab Bar is also rendered at `bottom: 0` (occupying `84pt` of vertical height).
- Consequently, the native tab bar sits directly on top of the bottom `84pt` of the `98pt` floating checkout container.
- This creates severe visual occlusion (85% of the checkout button is covered) and causes **complete touch event interception** by UIKit's `UITabBar` layer, preventing users from tapping "Proceed to Checkout".

This audit details the exact component hierarchy, geometry, hit-testing layers, comparison with stack-based screens (`product/[slug]` and `checkout/index`), and outlines 3 concrete fix options.

---

## 2. Exact Symptom Description

1. **Visual Overlap**: On the Cart tab, the native Liquid Glass tab bar covers almost the entirety of the bottom checkout bar. Only the top `~14pt` of the floating container is visible above the tab bar.
2. **Touch Interception / Unresponsive Button**: Tapping the "Proceed to Checkout" button or the Total price area registers touches on the native tab bar (or fails completely) because the native `UITabBar` view layer sits above the tab screen's child content.
3. **Double Bar Clutter**: Even if the floating bar were pushed upward, two stacked floating bars (Tab Bar + Commerce Bar) would consume over 180pt (~22%) of the vertical viewport.

---

## 3. Cart Component Hierarchy

```
<View style={styles.container}> (flex: 1, backgroundColor: colors.background)
  │
  ├── <HeaderBar title="Shopping Cart" showBack={false} showWishlist={true} showCart={false} />
  │
  ├── <KeyboardAvoidingView style={{ flex: 1 }}>
  │     │
  │     └── <ScrollView contentContainerStyle={styles.scrollContent}>
  │           │
  │           ├── Top Row: "Items in Bag (N)" + [Clear All]
  │           │
  │           ├── Items List (map over items):
  │           │     └── <Card style={styles.cartCard}>
  │           │           ├── Product Thumbnail (80x102)
  │           │           ├── Product Name & [Trash2] Remove Button
  │           │           ├── Size & Height Details
  │           │           ├── Unit Price
  │           │           └── Quantity Stepper (- 1 +) & Line Total
  │           │
  │           ├── Coupon Section: <Card> (Input + [Apply] Button + Success Badge)
  │           │
  │           └── Price Breakdown: <Card>
  │                 ├── Subtotal
  │                 ├── Coupon Discount (if applied)
  │                 ├── Estimated Shipping (Free over ₹500)
  │                 └── Total Amount
  │
  └── <FloatingActionContainer> (position: 'absolute', bottom: 0) <--- CONFLICT WITH TAB BAR
        └── Total Price + Button: [Proceed to Checkout]
```

---

## 4. Bottom CTA Architecture

In `mobile/app/(tabs)/cart.tsx` (lines 362–385):
```tsx
{/* Floating Bottom Checkout CTA */}
<FloatingActionContainer>
  <View style={styles.bottomBarContent}>
    <View style={styles.totalPriceBlock}>
      <Text style={[typography.caption1, { color: colors.textSecondary }]}>Total</Text>
      <Text style={[typography.priceMedium, { color: colors.primary }]}>
        {formatPrice(finalTotal)}
      </Text>
    </View>

    <Button
      title="Proceed to Checkout"
      onPress={() => {
        haptic.light();
        router.push('/checkout');
      }}
      variant="primary"
      size="md"
      rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
      style={{ flex: 1, marginLeft: spacing.md }}
    />
  </View>
</FloatingActionContainer>
```

And in `mobile/src/components/layout/FloatingActionContainer.tsx` (lines 34–50, 53–70):
```tsx
export const FloatingActionContainer: React.FC<FloatingActionContainerProps> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { spacing } = useTheme();
  const containerHeight = spacing.bottomBarHeight + insets.bottom; // 64 + 34 = 98pt

  return (
    <GlassSurface
      variant="floating"
      style={[
        styles.container,
        {
          height: containerHeight,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>{children}</View>
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, // <--- ANCHORED AT SCREEN BOTTOM: 0
    left: 0,
    right: 0,
    width: '100%',
    justifyContent: 'center',
    zIndex: 10,
  },
});
```

---

## 5. Native Tab Bar Configuration (`mobile/src/navigation/NativeTabs.tsx` & `(tabs)/_layout.tsx`)

- `(tabs)/cart.tsx` is configured as a native tab item inside `NativeTabs`.
- On native iOS builds, `NativeTabs` uses `@react-navigation/bottom-tabs/unstable` which renders a native iOS `UITabBar`.
- On iPhone 17 Pro (and other modern iPhones with home indicator):
  - Tab Bar Content Height: `50pt`
  - Safe Area Bottom Inset (`insets.bottom`): `34pt`
  - Total Tab Bar Height: **`84pt`**
- The Native Tab Bar sits at `bottom: 0` spanning vertical coordinates `y_bottom: 0` to `y_bottom: 84pt`.

---

## 6. Safe Area & Vertical Coordinate Breakdown

| Layout Element | Vertical Extent (from Screen Bottom) | Visual Height | Layer Position |
| :--- | :---: | :---: | :---: |
| **Physical Screen Bottom** | `0pt` | — | Base |
| **Home Indicator Inset** | `0pt` to `34pt` | `34pt` | Hardware Safe Area |
| **Native Bottom Tab Bar** | **`0pt` to `84pt`** | **`84pt`** | **Parent Navigation Layer (Above Screen Content)** |
| **`<FloatingActionContainer>`** | **`0pt` to `98pt`** | **`98pt`** | **Child Screen Layer (Below Native Tab Bar)** |
| **Checkout Button Content** | **`34pt` to `90pt`** | **`56pt`** | **Occluded Region (`34pt` to `84pt` covered by tab bar)** |
| **Visible Unoccluded CTA Slice** | **`84pt` to `98pt`** | **`14pt`** | **Only top rim visible** |

---

## 7. ScrollView Analysis

In `cart.tsx`:
- `ScrollView contentContainerStyle`: `paddingBottom: spacing.bottomBarHeight + insets.bottom + 36` (`76 + 34 + 36 = 146pt`).
- The scroll content (items, coupon box, and order breakdown) can scroll up by `146pt`, which clears the bottom area.
- However, because the `<FloatingActionContainer>` is outside the `ScrollView` and anchored at `position: 'absolute', bottom: 0`, it does not scroll with the content and stays trapped behind the native tab bar.

---

## 8. Absolute Positioning Analysis

- `FloatingActionContainer` uses `position: 'absolute', bottom: 0`.
- In a standalone screen without tabs (such as `product/[slug]` or `checkout/index`), `bottom: 0` anchors the bar above the device's home indicator via its internal `paddingBottom: insets.bottom`.
- In a tab-hosted screen (`(tabs)/cart.tsx`), `bottom: 0` anchors the bar directly in the coordinate space already occupied by the persistent native bottom tab bar.

---

## 9. Z-Index & Layer Stacking Analysis

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 (Topmost): Native UITabBar (y_bottom: 0 to 84pt)   │
│  • Home, Categories, Wishlist, Cart, Account Tab Icons      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: FloatingActionContainer (y_bottom: 0 to 98pt)     │
│  • Total Price + [Proceed to Checkout]                      │
│  • (Bottom 84pt occluded by Layer 3)                        │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: Cart ScrollView Content                           │
│  • Items list, Coupon box, Price breakdown card             │
└─────────────────────────────────────────────────────────────┘
```

Because `NativeTabs` (UIKit's `UITabBarController`) wraps the tab screen's container, the native tab bar is structurally a parent/sibling overlay above the screen's subviews. React Native's `zIndex: 10` only affects sibling ordering inside the React root view and cannot elevate content above the native `UITabBar`.

---

## 10. Hit-Testing & Touch Interception Analysis

- **Touch Interception Confirmed**: YES.
- When the user taps in the bottom `84pt` region of the display, the native iOS event dispatcher delivers touch events to the `UITabBar` (or ignores them if tapping outside individual tab items).
- The `Button` inside `FloatingActionContainer` (located between `y_bottom: 34pt` and `y_bottom: 90pt`) receives no `onTouchStart` / `onPress` events because the hit test is intercepted by the native tab bar layer.

---

## 11. Comparison with Other Screens

| Screen | Tab Bar Present? | Bottom Action Technique | Occluded? | Touch Functional? |
| :--- | :---: | :---: | :---: | :---: |
| **Product Detail** (`app/product/[slug].tsx`) | **NO** (Stack screen) | `<FloatingActionContainer>` at `bottom: 0` | **NO** | **YES (100%)** |
| **Checkout** (`app/checkout/index.tsx`) | **NO** (Stack screen) | `<FloatingActionContainer>` at `bottom: 0` | **NO** | **YES (100%)** |
| **Wishlist** (`app/(tabs)/wishlist.tsx`) | **YES** (Tab screen) | No floating bar; ScrollView `paddingBottom` | **NO** | **YES (100%)** |
| **Account** (`app/(tabs)/account.tsx`) | **YES** (Tab screen) | No floating bar; ScrollView `paddingBottom` | **NO** | **YES (100%)** |
| **Shopping Cart** (`app/(tabs)/cart.tsx`) | **YES** (Tab screen) | `<FloatingActionContainer>` at `bottom: 0` | **YES (Bug present)** | **NO (Touches blocked)** |

---

## 12. UI-5 Regression Analysis

During Phase UI-5:
1. `cart.tsx` was redesigned to adopt the `<FloatingActionContainer>` primitive (which had been created for root stack commerce screens).
2. Because `FloatingActionContainer` was hardcoded to `bottom: 0`, placing it inside a tab-hosted screen immediately created the collision with `NativeTabs`.
3. The previous implementation of `cart.tsx` had the "Proceed to Checkout" button located inside the scrollable Order Summary Card, which was naturally above the tab bar.

---

## 13. Root Cause Candidates

| Candidate | Description | Assessment |
| :--- | :--- | :---: |
| **P0: Tab-Hosted Floating Bar Collision** | Using `position: 'absolute', bottom: 0` inside a tab screen where the native tab bar occupies `bottom: 0` to `84pt`. | **PRIMARY ROOT CAUSE** |
| **P1: Native Tab Touch Interception** | Native `UITabBar` sitting in a parent window layer above the React Native view hierarchy. | **SECONDARY EFFECT** |
| **P2: Double Bar Viewport Congestion** | Stacking two floating bars (Tab Bar + Floating Commerce Bar) consumes over 22% of screen height. | **ARCHITECTURAL CONCERN** |

---

## 14. Primary Root Cause

### **PRIMARY ROOT CAUSE**:
`mobile/app/(tabs)/cart.tsx` renders a bottom-anchored `<FloatingActionContainer>` (`position: 'absolute', bottom: 0`) inside a **Tab Navigator Screen**. The native iOS bottom tab bar occupies `bottom: 0` to `84pt` in the same coordinate space. The native tab bar physically covers 85% of the checkout container and intercepts all touch events in that region.

---

## 15. Evidence from Code

1. **`mobile/app/(tabs)/cart.tsx` (Lines 363–385)**:
   ```tsx
   <FloatingActionContainer>
     <View style={styles.bottomBarContent}>
       ...
       <Button title="Proceed to Checkout" onPress={() => router.push('/checkout')} />
     </View>
   </FloatingActionContainer>
   ```
2. **`mobile/src/components/layout/FloatingActionContainer.tsx` (Lines 54–62)**:
   ```tsx
   container: {
     position: 'absolute',
     bottom: 0, // <--- Directly underneath native tab bar
     left: 0,
     right: 0,
     width: '100%',
     justifyContent: 'center',
     zIndex: 10,
   }
   ```
3. **`mobile/src/navigation/tab-config.ts` (Lines 55–64)**:
   ```tsx
   {
     name: 'cart',
     title: 'Cart',
     minimizeBehavior: 'none', // <--- Tab bar is permanently present at bottom: 0
   }
   ```

---

## 16. Proposed Fix Options

### **OPTION A: Standard E-Commerce Tab Architecture (Recommended — Cleanest & Most Robust)**
- **Description**:
  - Remove `<FloatingActionContainer>` from `(tabs)/cart.tsx`.
  - Place the "Proceed to Checkout" `<Button>` directly inside the **Price Breakdown Card** right below the Total Amount row (with `size="lg"` and `rightIcon={<ArrowRight />}`).
  - Maintain the `ScrollView` `contentContainerStyle` with `paddingBottom: spacing.bottomBarHeight + insets.bottom + 24` (`~134pt`), ensuring the complete summary card and button scroll freely and comfortably clear of the bottom tab bar.
- **Pros**:
  - 100% standard for e-commerce tab screens (matches Apple Store, ASOS, Nike, Myntra).
  - Eliminates the cluttered "double bottom bar" (no competing bars taking up 180pt of screen).
  - 100% reliable touch response with zero hit-testing interception.
  - Natural user flow: User reviews items → enters coupon → reviews subtotal/shipping/total → taps "Proceed to Checkout".
  - Cleanest code with zero platform-specific bottom offset hacks.
- **Cons**: Button is at the bottom of the order summary rather than permanently pinned to the viewport during item scrolling.
- **Risk**: **LOW (Zero navigation, safe-area, or layout risk)**.

---

### **OPTION B: FloatingActionContainer Offset Above Tab Bar**
- **Description**:
  - Keep `<FloatingActionContainer>`, but position it above the tab bar via `style={{ bottom: 84 }}` or `style={{ bottom: spacing.tabBarHeight + insets.bottom }}`.
  - Increase `ScrollView` `paddingBottom` to `184pt`.
- **Pros**: Button remains pinned during scrolling.
- **Cons**: Creates a double-stacked bar at the bottom of the screen (Tab Bar + Floating Bar = ~180pt high), consuming ~22% of the vertical viewport on mobile and looking visually cluttered. Tab bar height variations across devices can cause gap or overlap artifacts.
- **Risk**: **MEDIUM**.

---

### **OPTION C: Tab Minimization on Scroll**
- **Description**:
  - Change `cart` tab config to `minimizeBehavior: 'onScrollDown'`.
- **Pros**: Tab bar hides on scroll.
- **Cons**: When the user reaches the bottom or stops scrolling, the tab bar re-expands and covers the button again. High interaction complexity and potential jitter.
- **Risk**: **HIGH**.

---

## 17. Recommended Fix: **OPTION A**

**Option A is the recommended architectural solution** because:
1. It aligns Cart tab architecture with industry-standard mobile commerce design (Apple Store app, Nike, Myntra) where the primary shopping bag tab integrates the checkout action directly inside the financial summary.
2. It completely resolves both the visual occlusion and touch interception bugs.
3. It prevents the screen from feeling claustrophobic with two competing floating bars stacked on top of each other.
4. It is 100% resilient across iPhone SE, standard iPhones, Dynamic Island Pro models, Android devices, and Expo Go.

### Exact Changes Planned for Fix:
1. In `mobile/app/(tabs)/cart.tsx`:
   - Remove `<FloatingActionContainer>` from the bottom of the screen.
   - Insert `<Button title="Proceed to Checkout" onPress={() => router.push('/checkout')} variant="primary" size="lg" rightIcon={<ArrowRight size={20} color="#FFFFFF" />} style={{ marginTop: spacing.lg }} />` inside the Price Breakdown `<Card>`.
   - Remove unused `FloatingActionContainer` import.

---

## 18. Regression Risk Assessment

- **Product Detail Screen**: NO RISK (retains its own `<FloatingActionContainer>` which is outside tabs).
- **Checkout Screen**: NO RISK (retains its own `<FloatingActionContainer>` which is outside tabs).
- **Home / Categories / Wishlist / Account**: NO RISK (completely untouched).
- **Checkout Flow & Razorpay Logic**: NO RISK (`router.push('/checkout')` is preserved identically).
- **Dark Mode / Accessibility**: NO RISK (uses standard `Card` and `Button` tokens).

---

## 19. Files That Would Need Modification (During Fix Phase)

1. `mobile/app/(tabs)/cart.tsx` (Lines 19, 358–385: move Checkout Button into Price Breakdown Card; remove FloatingActionContainer)

---

## 20. Files That Must NOT Be Modified

- `mobile/src/components/layout/FloatingActionContainer.tsx` (Preserved for `product/[slug]` and `checkout/index`)
- `mobile/src/navigation/NativeTabs.tsx` (0 changes)
- `mobile/src/store/*` (0 changes)
- `mobile/src/api/*` (0 changes)
- `backend/*` (0 changes)
- `frontend/*` (0 changes)
