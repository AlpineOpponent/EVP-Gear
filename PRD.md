# Product Requirements Document (PRD): EVP-Gear

## 1. Executive Summary
**EVP-Gear** is a modular, local-first web application designed for gear management and pack planning. While optimized for backpacking, its structure is agnostic, allowing use cases like photography or climbing. The system revolves around a strict 3-tier Tag hierarchy (Top, Middle, Base) and a workflow divided into three distinct phases: **Edit** (Entry), **View** (Database), and **Pack** (Assembly & Analysis).

## 2. Core Concepts & Definitions

### 2.1 The Tag Hierarchy
The system relies on a dependent 3-layer structure. An item cannot belong to multiple paths.
*   **TT (Top-Tag):** The broadest category (e.g., *Sleep*, *Kitchen*). **Required.**
*   **MT (Middle-Tag):** Sub-category (e.g., *Sleeping Bags*, *Stoves*). *Optional.*
*   **BT (Base-Tag):** Specific classification (e.g., *3-Season*, *Gas Stoves*). *Optional.*

**Dependency Logic:**
1.  **Parent-Child Filtering:** Selecting a TT filters the MT dropdown to show only children of that TT. Selecting an MT filters the BT dropdown.
2.  **Child-Parent Auto-fill:** Selecting a specific BT automatically fills its parent MT and grandparent TT **only if that BT is globally unique** within the database (i.e., it only exists in one hierarchy). If the same BT string exists in different hierarchies, auto-fill is disabled to prevent incorrect associations.
3.  **Dynamic Creation:** Typing a string that does not exist in the database into any Tag field creates that Tag instantly upon saving the gear entry.
    *   **Safeguard:** A clear visual warning (e.g., badge or text "New Tag") must be displayed if the user is about to create a new Top-Tag to prevent typos from polluting the hierarchy.

### 2.2 Weight Types
Every gear item is assigned a weight category to calculate accurate Pack statistics:
*   **Standard:** Base gear (Tent, Backpack, Sleeping bag). *Default.*
*   **Worn:** Items worn on the body (Boots, Trousers). Excluded from "Base Weight."
*   **Consumable:** Items that deplete (Food, Water, Fuel). Excluded from "Base Weight."
    *   **Weight Override:** Consumables support a "Local Weight Override" in the Pack Page, as their weight varies trip-to-trip.

---

## 3. Page Functional Requirements

### 3.1 Page 1: EDIT (The Input Engine)
**Goal:** Create or Update gear entries with high speed and data integrity.

**UI Components:**
*   **Input Form:**
    *   **Name:** Text input (Required).
    *   **Brand:** Text input (Auto-suggest from existing DB brands).
    *   **Weight:** Numeric input (Grams only).
    *   **Weight Type:** Radio button or pill selector: [ **Standard** | Worn | Consumable ].
    *   **Notes:** Text area (Optional).
*   **Tagging Section (The Smart Dropdowns):**
    *   Three inputs: [ TT ] -> [ MT ] -> [ BT ].
    *   **Behavior:**
        *   **Scroll:** Arrow keys or scrollbar to view existing tags alphabetically.
        *   **Type-to-Search:** Filters list. Pressing `Enter` selects the top match.
        *   **Create:** Typing a unique string acts as a "Create New Tag" command.
        *   **Warning:** Show "Creating new category..." if TT is not in DB.
*   **Action Buttons:** "Save Entry", "Clear Form", "Delete" (if editing existing).

**Brand Logo Logic:**
*   System checks the `Brand` string against a dictionary of available logos (generated via Vite glob import).
*   **Match:** If `Brand` = "Carinthia" (case-insensitive) and the logo exists in the pre-cached dictionary, display the logo.
*   **No Match:** Display the Brand Name as plain text. This avoids 404 errors and local filesystem access issues.

### 3.2 Page 2: VIEW (The Database)
**Goal:** Browse the entire gear library.

**UI Components:**
*   **Search Header:**
    *   **Search Bar:** Text input.
    *   **Search Filters (3 Folder Tabs):**
        1.  **By Name:** Matches string in Name field.
        2.  **By Brand:** Matches string in Brand field.
        3.  **By Tag:** Matches string in any Tag layer (TT, MT, BT).
*   **The List:**
    *   Displays all gear cards.
    *   **Card Layout:** Brand Logo (or text) | Name | Weight | Tag Path (small text) | Edit Icon.
    *   Clicking a card opens it in the **Edit** page.

### 3.3 Page 3: PACK (The Builder)
**Goal:** Assemble a specific loadout and visualize weight distribution.

**Layout:**
*   **Split Screen:**
    *   **Left Panel (50% - Collapsible):** Gear Inventory (Source).
    *   **Right Panel (50%):** Current Pack (Destination).

**Left Panel (Inventory):**
*   Contains the same Search Bar + 3 Filter Tabs as the View Page.
*   Clicking an item adds it to the Right Panel.
*   **Toggle:** A button to collapse this panel to the left, letting the Right Panel take up 100% width for analysis.

**Right Panel (Current Pack):**
*   **Pack Header:**
    *   **Pack Selector:** Dropdown to switch between saved packs.
    *   **Actions:** "New Pack", "Duplicate Pack", "Save Changes", "Delete Pack".
*   **Pack List:**
    *   Items grouped visually by their **Top-Tag (TT)**.
    *   **Item Card:** Name | Brand | Weight.
    *   **Context Menu (3-dots):**
        *   *Multiplier:* "x2", "x3" (e.g., for gas canisters).
        *   *Weight Override:* For **Consumable** items, allows local weight override (e.g., 800g of food instead of base 400g).
        *   *Remove:* Deletes from current pack.
*   **Statistics Footer (Sticky/Fixed):**
    *   **Total Weight:** Sum of everything.
    *   **Base Weight:** (Total - Consumable - Worn).
    *   **Worn Weight:** Total of "Worn" items.

**Visualization (The Interactive Pie):**
*   A dynamic SVG/Canvas Pie Chart.
*   **Default State:** Shows weight distribution by **TT** (e.g., Sleep, Kitchen, Clothes).
*   **Interaction:**
    *   Click a slice (e.g., "Sleep").
    *   **Action:** The slice extrudes/pops out slightly.
    *   **Visual:** The slice is subdivided internally to show **MT** proportions (e.g., Sleeping Bag vs. Pad) without creating a new chart.
    *   Clicking an MT subdivision subdivides it further into **BT**.
    *   **Navigation:** Breadcrumbs (e.g., `Sleep > Sleeping Bags`) or a "Reset View" button allow the user to go back up levels.

**Export Feature:**
*   **"Export PDF" Button:**
    *   Generates a formatted PDF.
    *   **Process:** Capture Nivo chart as Base64 image to embed in PDF.
    *   **Header:** Pack Name + Date + Total Stats.
    *   **Body:** A checklist style layout (square checkbox on left) sorted by TT -> MT.
    *   **Footer:** The Pie Chart visual + Weight breakdown table.

---

## 4. Technical Architecture

### 4.1 Tech Stack (Recommendation)
*   **Frontend Framework:** React or Vue (ideal for the reactive state of the Tag dependencies).
*   **Styling:** Tailwind CSS (for rapid, responsive grid layouts).
*   **Icons:** Lucide or Heroicons.
*   **PDF Generation:** `jspdf` or `react-pdf`.

### 4.2 Data Model (Local Storage / IndexedDB)
Since there are no presets and the user builds the DB, the schema must be relational.

**Store: `gearItems`**
```json
{
  "id": "uuid-v4",
  "name": "Defence 4",
  "brand": "Carinthia",
  "weight": 1800, // integers in grams
  "weightType": "standard", // "standard" | "worn" | "consumable"
  "notes": "Broken Zipper",
  "tagPath": {
     "tt": "Sleep",
     "mt": "Sleepingbags",
     "bt": "3 Season"
  }
}
```

**Store: `packs`**
```json
{
  "id": "uuid-v4",
  "packName": "Winter Trip 2024",
  "items": [
     { "gearId": "uuid-ref", "qty": 1, "overrideWeight": null },
     { "gearId": "uuid-ref-2", "qty": 2, "overrideWeight": 800 }
  ]
}
```
*Note: We store the Tag Path directly on the item for easier indexing, rather than a separate Tag table, since this is a local-first app and we want to allow loose creation of tags.*

### 4.3 Algorithms & Logic
**Tag Dependency Algorithm (Edit Page):**
1.  **State:** Main `db` contains all items.
2.  **Derive Tags:**
    *   Get unique list of all `tt`.
    *   Get unique list of `mt` where `parent_tt` matches selection.
    *   Get unique list of `bt` where `parent_mt` matches selection.
3.  **Reverse Lookup:**
    *   `OnChange(BT)`: Find the first item in DB with this BT. Read its MT and TT. Set State.

---

## 5. Non-Functional Requirements
1.  **Local Persistence:** Data must survive a browser refresh (use IndexedDB via a wrapper like `Dexie.js` or `idb-keyval`).
2.  **Responsiveness:** Desktop priority. The Split Screen on "Pack" should stack vertically on mobile screens (Search on top, List on bottom).
3.  **Performance:** Searching the "View" list must be instantaneous (<100ms) for up to 500 items.
4.  **Privacy:** No data leaves the user's browser.

## 6. Future Roadmap (Out of Scope for v1)
*   Unit conversion (Imperial/Metric toggle).
*   Dedicated Tag Management Page (Rename/Delete tags in bulk).
*   Cloud Sync / User Accounts.
*   Image Upload (User custom photos).
