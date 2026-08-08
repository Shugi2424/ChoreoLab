# ChoreoLab — UI / UX

## Design Direction

ChoreoLab should feel **modern**, **professional**, **minimal**, and **feminine** — appropriate for a coaching tool in rhythmic gymnastics.

The interface prioritizes clarity and speed: coaches are building routines under time pressure and need immediate feedback.

---

## Color Palette

| Role           | Color                | Usage                                  |
| -------------- | -------------------- | -------------------------------------- |
| Primary        | Pink `#E91E8C`       | Buttons, active states, accents        |
| Secondary      | Purple `#7B2D8E`     | Headers, navigation, secondary actions |
| Background     | White `#FFFFFF`      | Page background                        |
| Surface        | Light pink `#FFF5FA` | Cards, panels                          |
| Text primary   | Dark `#1A1A2E`       | Body text                              |
| Text secondary | Gray `#5A6072`       | Labels, hints                          |
| Success        | Green `#0F7B4A`      | Valid requirements                     |
| Error          | Red `#B42318`        | Missing requirements, errors           |
| Warning        | Amber `#B54708`      | Warnings in validation panel           |

These will be defined as an MUI theme in `client/src/theme/theme.ts`.

---

## Typography

- **Font family:** `"Inter", "Roboto", "Helvetica", "Arial", sans-serif` (MUI default with Inter loaded)
- **Headings:** Semi-bold, purple
- **Body:** Regular, dark
- **Score values:** Bold, large, pink

---

## Component Style

- **Cards:** Rounded corners (`borderRadius: 12px`), subtle shadow, white or light-pink background
- **Buttons:** Rounded (`borderRadius: 8px`), no all-caps, primary = pink filled, secondary = purple outlined
- **Inputs:** MUI outlined variant, rounded
- **Lists:** Clean, spaced items with hover highlight
- **Icons:** MUI icons, consistent 24px

---

## Layout — App Shell

```
┌──────────────────────────────────────────────────────────┐
│  ChoreoLab logo          Dashboard  My Routines  Profile │  ← Top nav bar (purple)
├──────────────────────────────────────────────────────────┤
│                                                          │
│                     Page content                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Top navigation bar: purple background, white text
- Logo left, nav links right
- Coach name / logout on far right
- Responsive: hamburger menu on mobile

---

## Pages

### Login / Sign Up

- Centered card on light-pink background
- ChoreoLab logo at top
- Form fields: email, password (sign up adds name, club)
- Pink primary button
- Link to switch between login and sign up
- "Forgot password?" link on login

### Forgot / Reset Password

- Same centered card layout
- Email input (forgot) or new password input (reset)
- Confirmation message on success

### Dashboard

- Welcome message with coach name
- Three action cards in a row (stack on mobile):
  - **Create Routine** — pink accent, prominent
  - **My Routines** — list count badge
  - **Profile** — edit profile link

### My Routines

- List/table of routines: gymnast name, apparatus, age category, DB, DA, validity badge
- Actions per row: Open, Delete
- Empty state: illustration + "Create your first routine" CTA
- Sort by most recently updated

### Profile

- Form: first name, last name, email (read-only), club
- Change password section
- Save button

### Create Routine

- Simple form: gymnast name, apparatus (dropdown), age category (dropdown)
- "Start Building" button → navigates to Routine Builder

---

## Routine Builder

The most important screen. Three-panel layout on desktop:

```
┌──────────────┬──────────────────────┬──────────────────┐
│              │                      │                  │
│   Timeline   │   Inventory Panel    │   Score Panel    │
│   (left)     │    (center)          │   (right)        │
│              │                      │                  │
│  Ordered     │  Pick item type,     │   DB: 0.0       │
│  list of     │  compose risk/       │   DA: 0.0       │
│  items       │  mastery, drag to    │                  │
│              │  timeline            │   Validation     │
│  Drag to     │                      │   Panel          │
│  reorder     │  Edit selected     │   (placeholder   │
│              │  item inline         │    until M7)     │
│  Click to    │                      │                  │
│  select      │                      │                  │
│              │                      │                  │
└──────────────┴──────────────────────┴──────────────────┘
```

### Timeline (left panel)

- Vertical ordered list of routine items
- Each item shows: order number, type label, name/value
- Color-coded by domain: **DB** (body + risk) blue `#1976D2`, **DA** (mastery) purple `#7B2D8E`, **Artistry** orange `#E65100`
- Click to select → populates inventory panel for editing
- **Drag-and-drop reorder** is the primary way to change item order (drag handle on each row)
- Drop indicator matches the dragged item's type color
- Up/down buttons as fallback for keyboard users and touch devices without drag
- Remove button per item
- Accept drops from inventory (body elements, artistry) at insert position

**Implementation:** `@dnd-kit/core` + `@dnd-kit/sortable`; persist order via `reorderRoutineItems` mutation on drop.

### Inventory Panel (center)

- Tab or type selector for **Body (DB)**, **Risk (DB)**, **Apparatus (DA)**, **Artistry (A)**
- **Body Element:** searchable dropdown filtered by apparatus and category; drag row to timeline
- **Risk:** criteria multi-select + rotation rows; live validation; drag composed risk to timeline
- **Mastery:** base + criteria pickers with combination rules; optional rotation; drag composed mastery to timeline
- **Artistry:** searchable dropdown; drag row to timeline
- When a timeline item is selected, the panel switches to edit mode for that item
- Compact picker styling (`compactPickerStyles.ts`) — readable but space-efficient
- CoP values displayed with one decimal place (`formatCopValue`)

### Score Panel (right)

- **DB Score** — large pink number (live recalculation in M6)
- **DA Score** — large purple number (live recalculation in M6)
- **Validation Panel** below scores (full engine in M7):
  - Green checkmarks for met requirements
  - Red X for missing requirements
  - Amber warnings where applicable
  - Grouped by domain (DB, DA, Artistry)
- Auto-save indicator when mutations are in flight

### Mobile Layout

On small screens, panels stack vertically:

1. Score + validation (top — most important feedback)
2. Timeline
3. Editing panel

Use MUI `useMediaQuery` or `Grid` breakpoints.

---

## Interaction Patterns

| Action              | Behavior                                                        |
| ------------------- | --------------------------------------------------------------- |
| Add item            | Compose in inventory → drag to timeline or submit → mutation → UI updates |
| Remove item         | Confirmation dialog → mutation                                  |
| Reorder             | **Drag-and-drop** (primary) or up/down buttons → mutation       |
| Change item content | Edit in inventory panel → mutation on save                      |
| Save routine        | Auto-saved on every change (saving indicator in score panel)    |
| Navigate away       | No unsaved warning needed (auto-save)                           |

---

## Feedback & Loading

- **Loading:** MUI `CircularProgress` centered in panel
- **Errors:** MUI `Alert` component, red, dismissible
- **Empty states:** Friendly message + CTA button
- **Success:** Snackbar for destructive actions (delete routine)

---

## Accessibility

- All interactive elements keyboard-accessible
- Form fields have visible labels
- Color is not the only indicator (icons + text for validation status)
- Sufficient contrast ratios (WCAG AA)

---

## Current State vs Target

| Area            | Status                                                 |
| --------------- | ------------------------------------------------------ |
| MUI theme       | ✅ Implemented                                         |
| React Router    | ✅ Implemented                                         |
| App shell / nav | ✅ Implemented                                         |
| Auth pages      | ✅ Implemented                                         |
| Dashboard       | ✅ Implemented                                         |
| My Routines     | ✅ Implemented                                         |
| Profile         | ✅ Implemented                                         |
| Routine Builder | ✅ Implemented (M5 — inventory, timeline DnD, validation) |
| Visual polish   | ❌ Milestone 8                                         |

---

## MUI Theme Setup (planned)

```typescript
// client/src/theme/theme.ts
const theme = createTheme({
  palette: {
    primary: { main: "#E91E8C" },
    secondary: { main: "#7B2D8E" },
    background: { default: "#FFFFFF", paper: "#FFF5FA" },
    success: { main: "#0F7B4A" },
    error: { main: "#B42318" },
    warning: { main: "#B54708" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: "none" } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});
```

This theme was implemented in Milestone 0. A dedicated visual and UX pass is **Milestone 8 — Client UI Polish** in [ROADMAP.md](./ROADMAP.md).
