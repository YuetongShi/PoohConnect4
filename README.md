# 🍯 Pooh Connect 4

A Hundred Acre Wood–themed **Connect 4** web game built with pure HTML5 Canvas and modular Vanilla JavaScript. Play locally as **Winnie the Pooh** vs. **Tigger** in a honey-filled gravity drop board!

🔗 **Live Demo:** [Play Pooh Connect 4](https://yuetongshi.github.io/PoohConnect4/main.html)

---

## ✨ Features

* **Storybook Visual Theme:** Inspired by the classic Hundred Acre Wood map and Winnie the Pooh's iconic honey-gold & red-shirt palette.
* **Physics-Based Free-Fall Animation:** Smooth gravity acceleration (`requestAnimationFrame`) drops each character piece into its target slot.
* **Interactive Hover Preview:** Highlights the exact valid landing cell in warm honey gold with a pointer cursor, keeping illegal or full slots non-interactive.
* **Anti-Draw Competitive Rule:** Standard 4-in-a-row detection (horizontal, vertical, and both diagonals). If the board fills up completely without a 4-in-a-row, **Player 2 (Tigger)** automatically wins to offset Player 1's first-move advantage!
* **Game Modes:**
  * **Double Players:** Local 2-player head-to-head (Available now).
  * **Single Player:** AI opponent (Coming soon).

---

## 🏗️ Architecture & Project Structure

The project follows a strict **separation of concerns**, decoupling the underlying board data model and game rules engine from the HTML5 Canvas view layer:

```text
PoohConnect4/
├── Graphics/           # Character faces (pooh_face, tigger_face), mascot & background art
├── main.html           # Landing page & mode selection (?mode=single / ?mode=double)
├── game.html           # Game arena layout & Winnie-themed styling
├── board.js            # Data Layer: 6x7 grid state management & boundary validation
├── game.js             # Rules Engine: Gravity validation, turn progression & 4-in-a-row win detection
├── gameplay.js         # View & Controller: Canvas rendering, mouse hit-testing & drop animations
└── README.md           # Project documentation
