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
│   Timeline   │    Editing Panel     │   Score Panel    │
│   (left)     │    (center)          │   (right)        │
│              │                      │                  │
│  Ordered     │  Form for selected   │   DB: 3.2       │
│  list of     │  item type:          │   DA: 1.8       │
│  items       │  - pick element      │                  │
│              │  - pick bases/crit   │   Validation     │
│  Drag to     │  - pick artistry     │   Panel          │
│  reorder     │                      │   ✓ 6 elements  │
│              │  Add item buttons    │   ✗ Missing risk│
│  Click to    │  at bottom           │   ✗ Need balance│
│  select      │                      │                  │
│              │                      │                  │
└──────────────┴──────────────────────┴──────────────────┘
```

### Timeline (left panel)

- Vertical ordered list of routine items
- Each item shows: order number, type icon, name/code
- Click to select → populates editing panel
- Drag handle for reorder (or up/down buttons as fallback)
- Remove button per item
- "Add item" buttons at bottom: Body Element, Risk, Mastery, Artistry

### Editing Panel (center)

- Shows form for the **selected** timeline item
- Body Element: searchable dropdown filtered by apparatus and category
- Risk: searchable dropdown filtered by apparatus
- Mastery: base selector + criteria selector with live validation of combination rules
- Artistry: searchable dropdown of artistry components
- Empty state when no item selected: "Select an item from the timeline or add a new one"

### Score Panel (right)

- **DB Score** — large pink number, updates live
- **DA Score** — large purple number, updates live
- **Validation Panel** below scores:
  - Green checkmarks for met requirements
  - Red X for missing requirements
  - Amber warnings where applicable
  - Grouped by domain (DB, DA, Artistry)

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
| Add item            | Mutation → server recalculates → UI updates scores + validation |
| Remove item         | Confirmation dialog → mutation → recalculate                    |
| Reorder             | Drag or buttons → mutation → recalculate                        |
| Change item content | Mutation on save/select → recalculate                           |
| Save routine        | Auto-saved on every change (no explicit save button needed)     |
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
| MUI theme       | ❌ Not created                                         |
| React Router    | ❌ Not installed                                       |
| App shell / nav | ❌ Not created                                         |
| Auth pages      | ❌ Not created                                         |
| Dashboard       | ❌ Not created                                         |
| Routine Builder | ❌ Not created                                         |
| Current UI      | Plain HTML/CSS demo showing API health + elements list |

The existing `App.tsx` will be replaced by the routed page structure defined here.

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

This will be implemented in Milestone 0 (Foundation). A dedicated visual and UX pass is **Milestone 8 — Client UI Polish** in [ROADMAP.md](./ROADMAP.md).
