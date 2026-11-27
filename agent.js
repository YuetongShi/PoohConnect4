class Agent {
  // Currently AI plays as PLAYER_2, supporting 'random' and 'greedy' (minimax coming next)
  constructor(player = PLAYER_2, strategy = 'greedy') {
    this.player = player;
    this.strategy = strategy;
  }

  getValidMoves(game) {
    const validMoves = [];
    const rows = game.board.rows;
    const cols = game.board.cols;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Bottom-up scan: the first valid cell in column c is the only gravity-legal move
        if (game.isValidMove(this.player, r, c)) {
          validMoves.push({ row: r, col: c });
          break;
        }
      }
    }

    return validMoves;
  }

  // Choose move according to strategy ('random' | 'greedy')
  chooseMove(game) {
    if (game.gameOver || game.currentPlayer !== this.player) {
      return null;
    }

    switch (this.strategy) {
      case 'greedy':
        return this.chooseGreedyMove(game);
      case 'random':
      default:
        return this.chooseRandomMove(game);
    }
  }

  chooseRandomMove(game) {
    const validMoves = this.getValidMoves(game);
    if (validMoves.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }

  // Greedy 1-ply lookahead: simulate each valid move, evaluate, and pick the highest score
  chooseGreedyMove(game) {
    const validMoves = this.getValidMoves(game);
    if (validMoves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMoves = [];

    for (const move of validMoves) {
      // 1. Simulate placing piece on the board
      game.board.grid[move.row][move.col] = this.player;

      // 2. Evaluate the resulting board state
      const score = this.eval(game);

      // 3. Undo simulated move cleanly
      game.board.grid[move.row][move.col] = EMPTY;

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    // Break ties randomly so gameplay stays varied
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
  }

  // Zero-sum heuristic evaluation from this.player's perspective, positive means advantage
  eval(game) {
    const opponent = this.player === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    const myScore = this.evaluatePlayer(game.board, this.player);
    const oppScore = this.evaluatePlayer(game.board, opponent);

    return myScore - oppScore;
  }

  // Score a single player's board presence and 4-in-a-row threats
  evaluatePlayer(board, player) {
    const opponent = player === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    const rows = board.rows;
    const cols = board.cols;

    let pieceCount = 0;
    let openFourLines = 0;
    let twoInARowCount = 0;
    let threeInARowCount = 0;

    // 1. Count total pieces (+10 per piece)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board.getCell(r, c) === player) {
          pieceCount++;
        }
      }
    }

    // 2. Scan all 4-cell windows across 4 directions
    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal up-right
      [1, -1]  // Diagonal up-left
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        for (const [dr, dc] of directions) {
          const endR = r + 3 * dr;
          const endC = c + 3 * dc;

          if (!board.isValidPosition(endR, endC)) continue;

          let playerPieces = 0;
          let emptySlots = 0;
          let blockedByOpponent = false;

          for (let step = 0; step < 4; step++) {
            const cell = board.getCell(r + step * dr, c + step * dc);
            if (cell === player) {
              playerPieces++;
            } else if (cell === EMPTY) {
              emptySlots++;
            } else if (cell === opponent) {
              blockedByOpponent = true;
              break;
            }
          }

          if (blockedByOpponent) continue;

          // Immediate 4-in-a-row win
          if (playerPieces === 4) {
            return 10000;
          }

          // Unblocked 4-cell direction with at least 1 piece
          if (playerPieces > 0) {
            openFourLines++;
          }

          if (playerPieces === 3 && emptySlots === 1) {
            threeInARowCount++;
          } else if (playerPieces === 2 && emptySlots === 2) {
            twoInARowCount++;
          }
        }
      }
    }

    // 3. Base score + non-linear threat combo bonuses
    let totalScore = pieceCount * 10 + openFourLines * 50;

    // 3-in-a-row: double or triple+ are equally lethal (+8000)
    if (threeInARowCount >= 2) {
      totalScore += 8000;
    } else if (threeInARowCount === 1) {
      totalScore += 3000;
    }

    // 2-in-a-row: triple+ cannot all be blocked (+2400), double (+1100), single (+500)
    if (twoInARowCount >= 3) {
      totalScore += 2400;
    } else if (twoInARowCount === 2) {
      totalScore += 1100;
    } else if (twoInARowCount === 1) {
      totalScore += 500;
    }

    return totalScore;
  }
}