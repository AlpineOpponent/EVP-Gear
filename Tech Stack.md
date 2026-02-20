### 1. The Core Application
*   **Build Tool:** [Vite](https://vitejs.dev/)
    *   *Why:* Extremely fast development server. Optimized for modern browsers.
*   **Framework:** [React 19](https://react.dev/)
    *   *Why:* Component-based architecture fits the "Card" and "Chart" requirements perfectly.
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
    *   *Why:* **Crucial.** Strict data shape (`GearItem`, `TagPath`). Prevents accessing non-existent tags.

### 2. The Data Layer (Local First)
*   **Database:** [Dexie.js](https://dexie.org/)
    *   *Why:* Wrapper for **IndexedDB**. Allows querying gear like a real database. Handles thousands of items and stores `overrideWeight` for consumables.
*   **Data Hooks:** `useLiveQuery` (from `dexie-react-hooks`)
    *   *Why:* Makes the DB reactive. UI updates automatically when DB changes.

### 3. The UI & Design System
*   **Component Library:** [Shadcn/UI](https://ui.shadcn.com/)
    *   *Why:* Accessible, beautiful components using Tailwind CSS.
    *   *Specific use case:* **Combobox** for searchable/creatable Tag inputs.
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
    *   *Why:* Rapid styling and responsive layouts.
*   **Icons:** [Lucide React](https://lucide.dev/)
    *   *Why:* Clean, consistent SVG icons.

### 4. Logic & State Management
*   **Global State:** [Zustand](https://github.com/pmndrs/zustand)
    *   *Why:* Session State (search bar, current pack selection). Simpler than Redux.
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/)
    *   *Why:* Efficient "Watch" logic and validation integration.
*   **Validation:** [Zod](https://zod.dev/)
    *   *Why:* Schema-first validation for both DB entries and form inputs.

### 5. Visualization & Export
*   **Charts:** [Nivo (Pie)](https://nivo.rocks/pie/)
    *   *Why:* Built on D3 for React. Supports drill-down interactions and animations.
*   **PDF Generation:** [@react-pdf/renderer](https://react-pdf.org/) + [html2canvas](https://html2canvas.hertzen.com/)
    *   *Strategy:* Capture Nivo charts as Base64 images using `html2canvas` (or Nivo's internal SVG-to-Canvas export) and embed them into the `@react-pdf/renderer` document as `<Image />` tags.

---

### Project Structure

```text
/src
  /assets
    /brands          <-- 100+ PNG logos (Vite glob imported)
  /components
    /ui              <-- Shadcn components
    /charts          <-- Nivo Pie Chart with drill-down logic
    /forms           <-- GearEntryForm (React Hook Form + Zod)
    /layout          <-- Navbar, PageContainer
  /db
    db.ts            <-- Dexie schema
  /hooks
    useGearSearch.ts <-- Filtering logic
    useTagSuggestions.ts <-- Smart tag dependency logic
  /lib
    gearUtils.ts     <-- Calculation helpers
    logoAssets.ts    <-- Vite glob import for logos
    pdf-generator.tsx <-- React-PDF template
  /pages
    EditPage.tsx
    ViewPage.tsx
    PackPage.tsx
  /store
    usePackStore.ts  <-- Zustand store for pack building
    useSearchStore.ts <-- Zustand store for global search
  /types
    gear.ts          <-- Zod schemas & TS types
  App.tsx
  main.tsx
```
