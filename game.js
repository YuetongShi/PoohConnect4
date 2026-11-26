// Constants
const EMPTY = 0;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = PLAYER_1;
        this.winner = 0;
        this.gameOver = false;
    }

    isValidMove(player, row, col) {

        // 1. Game must still be ongoing
        if (this.gameOver)
            return false;

        // 2. Must be this player's turn, player is an integer
        if (this.currentPlayer !== player)
            return false;

        // 3. Coordinates must be inside the board boundaries
        if (!this.board.isValidPosition(row, col))
            return false;

        // 4. Target cell must be empty (0)
        if (this.board.getCell(row, col) !== EMPTY)
            return false;

        // 5. Gravity check: must be at the bottom row (0) OR have a piece directly underneath (row - 1)
        const isBottomRow = row === 0;
        const hasPieceBelow = !isBottomRow && this.board.getCell(row - 1, col) !== EMPTY;
        return isBottomRow || hasPieceBelow;
    }

    runTurn(row, col) {
        // If a winner was already produced, runTurn is not supposed to be called!
        if (!this.isValidMove(this.currentPlayer, row, col))
            throw Error("Invalid request!");

        this.board.setCell(row, col, this.currentPlayer);
        this.currentPlayer = this.currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    }

    updateWinner() {
        const rows = this.board.rows;
        const cols = this.board.cols;

        // The possible directions for a win
        const directions = [
            [0, 1],     // Horizontal
            [1, 0],     // Vertical
            [1, 1],     // Digonal
            [1, -1]     // Counter Diagonal
        ]

        // Check if any player has connected 4
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Get the owner of the cell before counting consecutive pieces
                const player = this.board.getCell(r, c);
                if (player === EMPTY)
                    continue;

                // Check all directions
                for (const [dr, dc] of directions) {
                    let count = 1   // Start from one consecutive piece
                    for (let step = 1; step < 4; step++) {
                        const nr = r + step * dr;
                        const nc = c + step * dc;

                        // Same color found
                        if(this.board.isValidPosition(nr, nc) && this.board.getCell(nr, nc) === player){
                            count++;

                            // If 4 is reached, update the winner immediately
                            if(count === 4){
                                this.winner = player;
                                this.gameOver = true;
                                return this.winner;
                            }
                        }
                        else
                            break;
                    }
                }
            }
        }

        // 2. Check if the top row (rows - 1) is completely full
        let isFull = true;
        const topRow = rows - 1;
        for (let c = 0; c < cols; c++) {
            if (this.board.getCell(topRow, c) === EMPTY) {
                isFull = false;
                break;
            }
        }

        // First player failed to win with first-move advantage -> Player 2 wins!
        if (isFull) {
        this.winner = PLAYER_2;
        this.gameOver = true;
        return this.winner;
        }

        // No winner yet
        return EMPTY;
    }
}