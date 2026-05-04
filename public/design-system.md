# UI Design System — Button & Color Specification
**Education Platform · Age group 18–65 · WCAG AA+**

---

## 1. Brand Color Palette

| Swatch | Name | Hex | Primary use |
|--------|------|-----|-------------|
| 🟫 | Dark teal-navy | `#152328` | Logo primary · button backgrounds · headings · icons |
| 🟨 | Lime yellow | `#D9EA85` | Logo accent · button text · highlights · hover text |

---

## 2. Full Color System

### 2.1 Background colors

| Name | Hex | Use |
|------|-----|-----|
| White | `#FFFFFF` | Page background · card surfaces |
| Off-white | `#F7F8F4` | Alternate section bg · table zebra rows |
| Pale lime tint | `#EAF2D7` | Info banners · success highlights · card bg |
| Light gray | `#F0F0EC` | Code blocks · input backgrounds · disabled bg |

### 2.2 Text & icon colors

> ⚠️ Never use raw lime `#D9EA85` as text or icon color on white — contrast ratio is ~1.3:1, completely unusable.

| Name | Hex | Use |
|------|-----|-----|
| Dark teal-navy | `#152328` | Headings · active nav · badges · primary icons |
| Forest green | `#3D6B2C` | Links · progress bars · success tags · category labels |
| Body text | `#2C2C2A` | All body copy · labels · descriptions |
| Mid gray | `#444441` | Subheadings · captions · placeholder text |
| Muted gray | `#B0AFA8` | Disabled text · hints · dividers |

### 2.3 Semantic / status colors

| Name | Hex | Use |
|------|-----|-----|
| Success green | `#2E7D32` | Correct answers · completion · saved states |
| Warning amber | `#B45309` | Deadline alerts · partial progress · caution |
| Error red | `#B91C1C` | Form errors · failed states · destructive actions |
| Info blue | `#1565C0` | Tips · informational banners · neutral notices |

---

## 3. Button Specifications

### 3.0 Shared base — applies to ALL buttons

| Property | Value |
|----------|-------|
| Font size | `15px` |
| Font weight | `500` (medium) |
| Border radius | `10px` — rounded rectangle, never pill |
| Padding | `12px 28px` |
| Min height | `48px` — WCAG 2.5.5 touch target for 40+ users |
| Transition | `background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s` |
| Active / click | `transform: scale(0.97)` |
| Focus ring | `box-shadow: 0 0 0 3px #D9EA85` — keyboard accessible |
| Cursor | `pointer` |
| Disabled | `opacity: 0.45` · `cursor: not-allowed` |

---

### 3.1 Primary button

**Use for:** Main CTAs — Enroll, Start learning, Buy, Submit. **Maximum 1 per screen section.**

| State | Background | Text | Border |
|-------|-----------|------|--------|
| Default | `#152328` | `#D9EA85` | `2px solid transparent` |
| Hover | `#1E353D` | `#FFFFFF` | `2px solid #D9EA85` |
| Active | `#152328` | `#D9EA85` | — + `scale(0.97)` |
| Focus | `#152328` | `#D9EA85` | focus ring `0 0 0 3px #D9EA85` |
| Disabled | `#152328` at 45% | `#D9EA85` | `opacity: 0.45` |

```css
.btn-primary {
  background:    #152328;
  color:         #D9EA85;
  font-size:     15px;
  font-weight:   500;
  padding:       12px 28px;
  border-radius: 10px;
  border:        2px solid transparent;
  min-height:    48px;
  cursor:        pointer;
  transition:    background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
}
.btn-primary:hover       { background: #1E353D; color: #fff; border-color: #D9EA85; }
.btn-primary:active      { transform: scale(0.97); }
.btn-primary:focus-visible { box-shadow: 0 0 0 3px #D9EA85; outline: none; }
.btn-primary:disabled    { opacity: 0.45; cursor: not-allowed; }
```

---

### 3.2 Secondary button

**Use for:** Supporting actions — Browse courses, Learn more, See all. Can appear alongside primary.

| State | Background | Text | Border |
|-------|-----------|------|--------|
| Default | `#EAF2D7` | `#152328` | `2px solid transparent` |
| Hover | `#D9EA85` | `#152328` | `2px solid transparent` |
| Active | `#D9EA85` | `#152328` | — + `scale(0.97)` |
| Focus | `#EAF2D7` | `#152328` | focus ring `0 0 0 3px #152328` |
| Disabled | `#EAF2D7` at 45% | `#152328` | `opacity: 0.45` |

```css
.btn-secondary {
  background:    #EAF2D7;
  color:         #152328;
  font-size:     15px;
  font-weight:   500;
  padding:       12px 28px;
  border-radius: 10px;
  border:        2px solid transparent;
  min-height:    48px;
  cursor:        pointer;
  transition:    background 0.15s, transform 0.1s;
}
.btn-secondary:hover       { background: #D9EA85; }
.btn-secondary:active      { transform: scale(0.97); }
.btn-secondary:focus-visible { box-shadow: 0 0 0 3px #152328; outline: none; }
.btn-secondary:disabled    { opacity: 0.45; cursor: not-allowed; }
```

---

### 3.3 Outlined (ghost) button

**Use for:** Low-priority actions — Sign in, Cancel, View demo. Zero visual weight at rest.

| State | Background | Text | Border |
|-------|-----------|------|--------|
| Default | `transparent` | `#152328` | `1.5px solid #152328` |
| Hover | `#152328` | `#D9EA85` | `1.5px solid #152328` |
| Active | `#152328` | `#D9EA85` | — + `scale(0.97)` |
| Focus | `transparent` | `#152328` | focus ring `0 0 0 3px #152328` |
| Disabled | `transparent` at 45% | `#152328` | `opacity: 0.45` |

```css
.btn-outline {
  background:    transparent;
  color:         #152328;
  font-size:     15px;
  font-weight:   500;
  padding:       10.5px 28px;   /* compensates for 1.5px border */
  border-radius: 10px;
  border:        1.5px solid #152328;
  min-height:    48px;
  cursor:        pointer;
  transition:    background 0.15s, color 0.15s, transform 0.1s;
}
.btn-outline:hover       { background: #152328; color: #D9EA85; }
.btn-outline:active      { transform: scale(0.97); }
.btn-outline:focus-visible { box-shadow: 0 0 0 3px #152328; outline: none; }
.btn-outline:disabled    { opacity: 0.45; cursor: not-allowed; }
```

---

## 4. Usage Rules

### 4.1 Button hierarchy per screen
- Maximum **1 primary button** per section / card
- Secondary buttons can appear multiple times alongside one primary
- Outlined buttons for cancel, back, or sign-in — never two outlined buttons side-by-side
- Never show two primary buttons next to each other — one loses meaning

### 4.2 Instead of lime on white — use this

| Hex | Use case |
|-----|----------|
| `#152328` | Icons · active nav items · badge text · section headings |
| `#3D6B2C` | Hyperlinks · progress fills · subject-category tags · success labels |
| `#EAF2D7` | Background tint for info cards, banners, highlight rows — never for text |
| `#2C2C2A` | All paragraph text · input labels · descriptions |

### 4.3 Age group 18–65 checklist
- ✅ Button `min-height: 48px` — safe tap target for 40+ mobile users (WCAG 2.5.5)
- ✅ Font size `15px` on buttons — readable without zoom for 55–65 age group
- ✅ Primary button contrast ~8.1:1 — exceeds WCAG AAA (7:1)
- ✅ Hover adds visible `border-color: #D9EA85` — clear affordance for cursor users
- ✅ `10px` border-radius — universally recognised as a button by all age groups
- ✅ `focus-visible` ring — keyboard and screen-reader accessible
- ✅ Text labels always present — no icon-only buttons, safe for colour-blind users

---

## 5. Quick Reference Cheatsheet

### Buttons

| Button | Default bg | Default text | Hover |
|--------|-----------|-------------|-------|
| Primary | `#152328` | `#D9EA85` | bg `#1E353D` · text `#fff` · border lime |
| Secondary | `#EAF2D7` | `#152328` | bg `#D9EA85` |
| Outlined | `transparent` | `#152328` | bg `#152328` · text `#D9EA85` |

### Shared tokens

| Token | Value | Notes |
|-------|-------|-------|
| Font size | `15px` | All buttons |
| Padding | `12px 28px` | Outlined: `10.5px 28px` (compensates border) |
| Border radius | `10px` | Rounded rect — never pill for buttons |
| Min height | `48px` | WCAG 2.5.5 touch target |
| Transition colors | `0.15s` | background, color, border-color |
| Transition transform | `0.1s` | active scale |
| Active scale | `0.97` | All buttons |
| Disabled opacity | `0.45` | All buttons |
