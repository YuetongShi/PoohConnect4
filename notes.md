# 🧠 Pooh Connect 4 - Engineering & Interview Notes

## 1. Architecture Decisions (Why Decoupled?)
* **Separation of Concerns:** Split into `Board` (pure $6 \times 7$ state), `Game` (stateless-UI rule engine), `Agent` (AI decision module), and `gameplay.js` (HTML5 Canvas view & input handler).
* **Benefit:** Allows the AI `Agent` to simulate and undo thousands of hypothetical moves directly on `board.grid` without triggering DOM/Canvas repaints.

## 2. Game Rules & Design Highlights
* **Anti-Draw Tiebreaker:** Connect 4 favors Player 1 (first-move advantage). If the board fills completely without a 4-in-a-row, Player 2 (Tigger) wins by default.
* **Coordinate Translation:** Backend uses bottom-up indexing (`row = 0` at bottom) to match gravity physics, while HTML5 Canvas uses top-down coordinates (`y = 0` at top), decoupled via `getCanvasY()`.

## 3. Heuristic AI Design (`eval`)
* **Non-Linear Threat Weights:**
  * Piece presence: `+10` | Open 4-cell direction: `+50`
  * 2-in-a-row: Single `+500`, Double `+1100`, Triple+ `+2400` (unblockable multi-fork setup)
  * 3-in-a-row: Single `+3000`, Double+ `+8000` (guaranteed next-turn win)
  * Immediate 4-in-a-row Win: `50000`

## 4. Technical Challenges & Lessons Learned
* **Iterative Heuristic Score Tuning (Reward Dilution Bug):**
  * Balancing the weights in `eval()` took multiple rounds of playtesting. Initially, `WIN` was set to `10000`, which occasionally got outscored by an overlapping combo of multiple 3-in-a-rows + 2-in-a-rows + open lines (`> 10000`), causing the AI to pick a "flashy setup move" instead of taking an immediate win. Raising `WIN` to `50000` resolved the dilution and guaranteed decisive winning moves.
* **Cross-Language Pitfalls (Coming from Python & Java to JavaScript):**
  * **`for...in` vs. `for...of`:** Coming from Python (`for x in list:`) and Java enhanced for-loops, I instinctively wrote `for (const [dr, dc] in directions)`. In JS, `in` iterates over **string indices** (`"0"`, `"1"`, ...) rather than array elements, destructuring `dc` as `undefined` and silently breaking 4-in-a-row win detection (`NaN` coordinates) until switched to `for...of`.
  * **Strict Equality (`===` vs. `==`):** Had to consciously enforce `===` across board state checks (`EMPTY`, `PLAYER_1`, `PLAYER_2`) to avoid JavaScript's implicit type coercion surprises (`0 == ""` or `0 == false`) that don't exist in strongly typed Java or Python.
