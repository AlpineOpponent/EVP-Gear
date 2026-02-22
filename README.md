<div align="center">
  <img src="public/evp.logo.dark.svg" alt="EVP-Gear Logo" width="120" />
  <h1>[EVP-Gear].(https://lleonhardwatzl.uk/).</h1>
  <p><strong>A modular, local-first web application designed for precise gear management and pack planning.</strong></p>

  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
</div>

<br />

EVP-Gear is an analytical, database-driven tool for backpackers, climbers, and photographers to obsessively track and analyze their equipment. Built for speed and privacy, it runs entirely in your browser using IndexedDB.

## 📸 The Interface

<table>
  <tr>
    <td>
      <strong>The Builder (Pack Page)</strong><br />
      <em>Assemble loadouts and analyze weight distribution via interactive Nivo pie charts.</em><br />
      <img src=".github/assets/pack.png" alt="Pack Page" width="100%" />
    </td>
    <td>
      <strong>The Input Engine (Edit Page)</strong><br />
      <em>Rapidly add gear using the dynamic 3-tier tagging system and Zod-validated forms.</em><br />
      <img src=".github/assets/edit.png" alt="Edit Page" width="100%" />
    </td>
  </tr>
  <tr>
    <td>
      <strong>The Database (View Page)</strong><br />
      <em>Search and filter your entire local gear inventory instantly.</em><br />
      <img src=".github/assets/view.png" alt="Database View" width="100%" />
    </td>
    <td>
      <strong>PDF Export</strong><br />
      <em>Generate beautiful, checklist-style PDF reports of your assembled packs.</em><br />
      <img src=".github/assets/export.png" alt="PDF Export" width="100%" />
    </td>
  </tr>
</table>

## ✨ Key Features

*   **Strict 3-Tier Hierarchy:** Organize gear by `Top-Tag` (e.g., Sleep), `Middle-Tag` (e.g., Sleeping Bags), and `Base-Tag` (e.g., 3-Season).
*   **Local-First Architecture:** Powered by Dexie.js (IndexedDB). Your data never leaves your browser. Fast, private, and works completely offline.
*   **Advanced Analytics:** Differentiates between `Standard`, `Worn`, and `Consumable` weights to give you accurate Base Weight calculations.
*   **Adaptive Theming:** Seamlessly switch between Dark, Light, and Nature themes (including dynamic browser favicons).
*   **Mobile Optimized:** The entire UI, including complex split-screen builders, is fully responsive for use on the trail.

## 🛠️ Tech Stack

*   **Core:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS v4, Shadcn UI
*   **State & Data:** Zustand (global state), Dexie.js (IndexedDB wrapper)
*   **Forms & Validation:** React Hook Form, Zod
*   **Visualization:** Nivo Charts, React-PDF

## 🚀 Getting Started

To run EVP-Gear locally:

1.  Clone the repository:
    ```bash
    git clone https://github.com/AlpineOpponent/EVP-Gear.git
    ```
2.  Navigate to the directory:
    ```bash
    cd EVP-Gear
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 🤝 Contributors

*   **[AlpineOpponent](https://github.com/AlpineOpponent)** - Creator & Lead Developer
*   **Gemini** - AI Development Assistant

<br />
<div align="center">
  <i>"Measure twice, pack once."</i>
</div>
