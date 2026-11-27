# 🍯 Pooh Connect 4

A Hundred Acre Wood–themed **Connect 4** web game built with pure HTML5 Canvas and modular Vanilla JavaScript. Play locally against a friend or challenge an intelligent **Tigger AI** powered by Minimax with Alpha-Beta pruning!

🔗 **Live Demo:** [Play Pooh Connect 4](https://yuetongshi.github.io/PoohConnect4/main.html)

---

## ✨ Features

* **Storybook Visual Theme:** Inspired by the classic Hundred Acre Wood map and Winnie the Pooh's iconic honey-gold & red-shirt palette, complete with custom character victory screens (`winnie.html` & `tigger.html`).
* **Physics-Based Free-Fall Animation:** Smooth gravity acceleration (`requestAnimationFrame`) drops each character piece into its target slot.
* **Interactive Hover Preview:** Highlights the exact valid landing cell in warm honey gold with a pointer cursor, keeping illegal or full slots non-interactive.
* **Anti-Draw Competitive Rule:** Standard 4-in-a-row detection (horizontal, vertical, and both diagonals). If the board fills up completely without a 4-in-a-row, **Player 2 (Tigger)** automatically wins to offset Player 1's first-move advantage!
* **Game Modes:**
  * **Double Players:** Local 2-player head-to-head (`Winnie the Pooh` vs. `Tigger`).
  * **Single Player (AI Opponent):** Configurable AI engine supporting **Random**, **1-Ply Greedy**, and **Depth-N Minimax with Alpha-Beta Pruning**.

---

## 🧠 AI Engine & Heuristic Design (`agent.js`)

The Single Player AI (`Agent`) decouples move search from board evaluation using deep board cloning (`board.clone()`) and center-first move ordering (`[3, 2, 4, 1, 5, 0, 6]`) to maximize Alpha-Beta cutoffs:

* **Search Algorithms:**
  * `random`: Selects uniformly from gravity-legal moves.
  * `greedy`: Evaluates all immediate 1-ply moves and selects the highest-scoring board state.
  * `minimax`: Recursive zero-sum game tree search with **Alpha-Beta pruning** and configurable lookahead depth (`maxDepth`).
* **Non-Linear Heuristic Evaluation (`eval`):**
  * **4-in-a-Row Win:** `+500,000` (strictly dominates all heuristic combinations to guarantee decisive winning moves)
  * **Piece Presence:** `+10` per piece on board
  * **Open 4-Cell Lines:** `+50` per unblocked potential 4-in-a-row direction
  * **2-in-a-Row Threats:** Single `+500` | Double `+1,100` | Triple+ `+2,400` (multi-fork setup that cannot be fully blocked)
  * **3-in-a-Row Threats:** Single `+3,000` | Double+ `+8,000` (guaranteed next-turn win)

---

## 🏗️ Architecture & Project Structure

The project follows a strict **separation of concerns**, decoupling the underlying board data model, game rules engine, and AI decision logic from the HTML5 Canvas view layer:

```text
PoohConnect4/
├── Graphics/           # Character faces (pooh_face, tigger_face), mascot & background art
├── main.html           # Landing page & mode selection (?mode=single / ?mode=double)
├── game.html           # Game arena layout & Winnie-themed styling
├── winnie.html         # Victory screen when Player 1 (Winnie the Pooh) wins
├── tigger.html         # Victory screen when Player 2 (Tigger) wins
├── board.js            # Data Layer: 6x7 grid state management, cloning & boundary validation
├── game.js             # Rules Engine: Gravity validation, turn progression & 4-in-a-row win detection
├── agent.js            # AI Engine: Random, Greedy & Alpha-Beta Minimax decision module
├── gameplay.js         # View & Controller: Canvas rendering, mouse hit-testing & drop animations
├── notes.md            # Engineering & architecture design notes
└── README.md           # Project documentation

## ⚠️ Disclaimer & Copyright Notice

* **Personal & Educational Use Only:** This project (*Pooh Connect*) was created strictly for personal learning, algorithmic exploration, and portfolio demonstration purposes.
* **Non-Commercial:** This application is completely non-profit. Commercial use, monetization, redistribution for profit, or any form of unauthorized commercial adaptation is strictly prohibited.
* **No Official Affiliation:** Winnie the Pooh and all related characters, names, and visual themes are trademarks and copyrights of **The Walt Disney Company** (and the estate of A.A. Milne / E.H. Shepard). This is an unofficial fan-made project and is **not** affiliated with, endorsed by, sponsored by, or connected to Disney in any way.
