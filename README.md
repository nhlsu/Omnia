# Omnia – Gift Registry

**SWE 363 Term Project · KFUPM · Milestone 4: Front-End (React)**

Omnia is a gift registry web app. Registry owners create wishlists for occasions such as birthdays, graduations, weddings and Eid, add gifts (by pasting a product link or by hand) and share a link. Guests open the link to reserve a gift or join a group gift, and admins keep the platform safe.

The UI follows our Milestone 3 Figma wireframes:
https://www.figma.com/design/pVNYAJ6BCqrFEAcvEnO6Fl/Omnia-%E2%80%93-Milestone-3-Wireframes--Copy-

---

## Tech stack

- **React 19** with **Vite**
- **React Router** for the screens
- **lucide-react** icons (admin pages) and inline SVG icons
- **Plain CSS**, sharing one set of theme variables (`src/styles/theme.css`)
- **No backend yet:** all data is kept in the browser's `localStorage` (see [Limitations](#limitations))

---

## Getting started

You need **Node.js 20 or newer**.

```bash
git clone https://github.com/nhlsu/Omnia.git
cd Omnia
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Check the code with ESLint |
| `npm run build` | Build the production version into `dist/` |
| `npm run preview` | Preview the production build |

---

## Demo data and accounts

Load the demo data once in your browser. Open the app, press **F12 → Console**, and run:

```js
await seedDemoData()
```

This adds two accounts, two occasion types, two supported stores, two wishlists with gifts, a reservation, pledges, a group-gift note and a report.

| Role | Email | Password |
|---|---|---|
| Registry owner | `owner@omnia.test` | `Omnia1234` |
| Admin | `admin@omnia.test` | `Omnia1234` |
| Guest | *no account*: open a wishlist link in a new tab | |

You can also sign up as a new owner at `/signup`. New accounts are always registry owners; admin accounts only come from the demo data.

**Start again from scratch:** run `localStorage.clear()` in the console, refresh, then `await seedDemoData()`.

---

## How to test each role

- **Owner:** log in at `/login`. You land on Home (`/`).
- **Admin:** log in as the admin. You land on `/admin`. The admin page is only open to admins; anyone else is redirected.
- **Guest:** open a wishlist link **in a new tab of the same browser**. The login lives in one tab only (`sessionStorage`), so a new tab acts as a logged-out guest.
  - Demo links: `/wishlist/registry-grad` (link only, with a group gift) and `/wishlist/registry-birthday` (public, can be reported).
  - Don't use an incognito window, another browser or a phone. They have their own, empty `localStorage`.
- **Auto-filling a gift from a link** only works for **active supported stores**. With the demo data, try `https://gifts.example/item-1`, or add a store (for example `amazon.sa`) in **Admin → Settings → Supported stores**.

---

## Screens and routes

Screen numbers (W1–W26) match the Figma file.

| Section | Screen | Route |
|---|---|---|
| **Account** | W1 Sign up | `/signup` |
| | W2 Log in | `/login` |
| | W3 Forgot password | `/forgot-password` |
| | W3b Set new password | `/reset-password` |
| **Registry owner** | W4 / W4b Home (and first-visit empty state) | `/` |
| | W5 Create wishlist (step 1 of 3) | `/my-wishlists/new` |
| | W6 / W7 / W7b Add a gift: by link, auto-filled, manual (step 2 of 3) | `/my-wishlists/:registryId/gifts/new` |
| | W8 Wishlist, owner view | `/my-wishlists/:registryId` |
| | W9 / W9b Edit gift, remove confirmation | `/my-wishlists/:registryId/gifts/:giftId/edit` |
| | W10 Wishlist settings (visibility) | `/my-wishlists/:registryId/settings` |
| | W11 Share wishlist (step 3 of 3) | `/my-wishlists/:registryId/share` |
| | W26 Profile | `/profile` |
| **Guest** | W12 / W12b Wishlist, guest view (and unavailable state) | `/wishlist/:registryId` |
| | W13 Gift details, W14 reserve sheet, W19 report sheet | `/wishlist/:registryId/gift/:giftId` |
| | W15 Reservation confirmed | `/wishlist/:registryId/reserved` |
| | W16 Manage / cancel reservation | `/wishlist/:registryId/manage` |
| | W17 Group gift | `/wishlist/:registryId/gift/:giftId/group` |
| | W18 Group gift notes | `/wishlist/:registryId/gift/:giftId/notes` |
| **Admin** | W20–W25 Dashboard, users, reports, supported stores, occasion types | `/admin` |

---

## Project structure

```
src/
├── App.jsx              All routes
├── AppContext.jsx       Shared data functions, in sections:
│                        Helpers · Account · Registry Owner · Guest · Admin
├── seedData.js          Demo data (seedDemoData)
├── main.jsx             App entry point
├── index.css            Global base styles
├── styles/theme.css     Shared colour, font and radius variables
├── components/          Shared components (Header, Toast, BottomSheet, Badge)
│   ├── owner/           Owner pieces: top bar, bottom nav, back header, gift form, icons
│   └── guest/           Guest pieces: header, gift card, status badge, reserve and report sheets
└── pages/
    ├── Account/         W1–W3b
    ├── owner/           W4–W11, W26
    ├── guest/           W12–W19
    └── admin/           W20–W25
```

**Team conventions:** each section keeps its pages in `pages/<section>/`. Pages only use the shared theme variables (`--color-primary`, `--color-text`, `--color-text-muted`, `--color-bg`, `--color-surface`, `--color-border`, `--color-success`, `--color-warning`, `--color-danger`, `--font-family`, `--radius`).

---

## Data

All data functions live in `src/AppContext.jsx` and read and write `localStorage`:

| Key | Holds |
|---|---|
| `omnia_users` | Accounts (passwords are salted and hashed with PBKDF2, never stored as plain text) |
| `omnia_registries` | Wishlists (owner, name, occasion, date, note, visibility, draft/published, hidden) |
| `omnia_gifts` | Gifts (name, price, quantity, notes, image, product link, store, group gift on/off) |
| `omnia_reservations` | Guest reservations, each with a 6-character code |
| `omnia_contributions` | Group-gift pledges |
| `omnia_notes` | Group-gift notes |
| `omnia_reports` | Guest reports |
| `omnia_supported_stores`, `omnia_occasion_types` | Managed by the admin |

The logged-in user is kept per tab in `sessionStorage`.

---

## Limitations

- **No server yet.** Data stays in each browser, so different browsers and devices don't share wishlists.
- **Product links are not really fetched.** Browsers can't read store pages directly (CORS), so `fetchProductInfo` checks the link against the admin's active stores and returns sample details. Unsupported stores fall back to manual entry (W7b).
- **Emails are not sent.** The password-reset link is simulated for the demo.

---

## Team

| Member | Section |
|---|---|
| Nadiah Albinali | Registry owner (W4–W11, W26) and owner data functions |
| Shahad Alsaleh | Guest (W12–W19) and guest data functions |
| Raghad Alyami | Account (W1–W3b), account functions, shared components, theme, demo data |
| Elham Moafa | Admin (W20–W25) and admin functions |

## AI use

This course follows **Level 3 "AI Collaboration"**. How each of us used AI is documented in [`AI_USAGE.md`](AI_USAGE.md).