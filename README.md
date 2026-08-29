# 🛒 Grocery Bud — Smart Shopping Dashboard

A polished, feature-packed grocery list with a bright dashboard UI, motion design, and celebration effects. Add items with **quantities, categories, and due dates**, track your progress, and never lose a list.

![Stack](https://img.shields.io/badge/HTML-CSS--JS-%23f7f7f7?style=flat-square&logo=html5&logoColor=%23e34f26)
![No build step](https://img.shields.io/badge/zero--dependencies-%2323b26d?style=flat-square)

---

## ✨ Features

- **Dashboard UI** — A centered, bright white/light-blue layout with live stat cards (total, active, completed, progress) and an animated progress bar.
- **Dark mode** — Toggle between the bright dashboard and a sleek dark theme; your preference is remembered.
- **Categories with color tags** — Group items into *Produce, Dairy, Bakery, Meat, Pantry, Frozen, Other* with color-coded badges and smart auto-suggestions from a common grocery dictionary.
- **Quantities & units** — Add amounts (e.g. `2 dozen eggs`) with a handy stepper control to bump counts up/down.
- **Due dates / reminders** — Attach an optional due date to any item; overdue items are highlighted so nothing slips your mind.
- **Completed celebrations** — Tick an item done and a refined confetti burst pops off the checkbox.
- **Search & filters** — Filter by *All / Active / Done* and search your items in real time.
- **Inline editing** — Double-click (or tap the pencil) to edit text directly in place.
- **Undo / redo** — A generalized undo history covers *add, delete, edit, complete, and clear* actions — plus a one-click Undo bar.
- **Share / export** — Export your list as a `.txt` file, a `.json` backup, or copy it to the clipboard to share anywhere.
- **Persistence** — Every change is auto-saved to `localStorage`; your list survives refreshing and closing the tab.

---

## 🚀 Getting Started

No dependencies or build step required — just serve the folder and open it.

```bash
# Option 1: open directly
open index.html

# Option 2: run a local server (recommended)
python3 -m http.server 8080
# then visit http://localhost:8080
```

---

## 🧰 Usage

| Action | How |
| --- | --- |
| Add item | Type in the box and press **Add** (or Enter) |
| Set quantity | Use the `− / +` stepper on an item |
| Pick category | Choose a badge or let auto-suggestion detect it |
| Set due date | Tap the calendar icon and pick a date |
| Mark done | Tap the checkbox → confetti! |
| Edit text | Double-click the item text or tap the pencil |
| Delete | Tap the trash icon |
| Undo | Tap **Undo** in the toast/bar, or use the Undo button |
| Redo | Use the Redo button after undoing |
| Filter / search | Use the toolbar above the list |
| Export / share | Use the **Share** button in the toolbar |
| Dark mode | Toggle the moon/sun icon in the header |

---

## 📁 Project Structure

```
GroceryCart/
├── index.html      # Dashboard markup
├── cart.css        # Styling, theming, animations, confetti
├── cart.js         # App logic, persistence, undo/redo, features
└── image/          # (legacy icon assets)
```

---

## 🛠 Customization

Colors and themes live in CSS custom properties at the top of `cart.css`:

```css
:root { /* light theme */}
:root[data-theme="dark"] { /* dark theme */}
```

Category colors are defined as a JS map in `cart.js` — add your own categories and matching colors there.

---

## 📄 License

MIT — free to use, modify, and share.
