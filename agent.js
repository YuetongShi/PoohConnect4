class Agent {
  // Configurable strategy ('random' | 'greedy' | 'minimax') and search depth (maxDepth)
  constructor(player = PLAYER_2, strategy = 'minimax', maxDepth = 2) {
    this.player = player;
    this.strategy = strategy;
    this.maxDepth = maxDepth;
  }

  // Scan board for all gravity-legal moves, ordered center-outward for faster Alpha-Beta pruning
  getValidMovesOnBoard(board, player) {
    const validMoves = [];
    const rows = board.rows;
    const cols = board.cols;

    // Center-first column ordering improves move quality and pruning efficiency
    const colOrder = [3, 2, 4, 1, 5, 0, 6].filter(c => c < cols);

    for (const c of colOrder) {
      for (let r = 0; r < rows; r++) {
        if (board.getCell(r, c) === EMPTY) {
          // Gravity check: either bottom row (r === 0) or cell directly below is occupied
          if (r === 0 || board.getCell(r - 1, c) !== EMPTY) {
            validMoves.push({ row: r, col: c });
          }
          break; // Only the lowest empty slot in column c is valid
        }
      }
    }

    return validMoves;
  }

  // Wrapper for external calls passing a Game instance
  getValidMoves(game) {
    return this.getValidMovesOnBoard(game.board, this.player);
  }

  // Dispatch move selection based on configured strategy
  chooseMove(game) {
    if (game.gameOver || game.currentPlayer !== this.player) {
      return null;
    }

    switch (this.strategy) {
      case 'minimax':
        return this.chooseMinimaxMove(game);
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

  // Greedy 1-ply lookahead using board.clone()
  chooseGreedyMove(game) {
    const validMoves = this.getValidMoves(game);
    if (validMoves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMoves = [];

    for (const move of validMoves) {
      const clonedBoard = game.board.clone();
      clonedBoard.setCell(move.row, move.col, this.player);

      const score = this.evalBoard(clonedBoard);

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
  }

  // Root entry point for Minimax with Alpha-Beta pruning up to `this.maxDepth`
  chooseMinimaxMove(game) {
    const validMoves = this.getValidMoves(game);
    if (validMoves.length === 0) return null;

    const opponent = this.player === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    let bestScore = -Infinity;
    let bestMoves = [];
    let alpha = -Infinity;
    const beta = Infinity;

    for (const move of validMoves) {
      // Use board.clone() to safely simulate the move without mutating live game state
      const clonedBoard = game.board.clone();
      clonedBoard.setCell(move.row, move.col, this.player);

      // Next ply belongs to the minimizing opponent (depth - 1)
      const score = this.minimax(clonedBoard, this.maxDepth - 1, alpha, beta, false, opponent);

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }

      alpha = Math.max(alpha, bestScore);
    }

    // Break ties randomly among equally optimal moves
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
  }

  // Recursive Minimax search with Alpha-Beta pruning
  minimax(board, depth, alpha, beta, isMaximizing, currentTurnPlayer) {
    const currentEval = this.evalBoard(board);

    // Terminal state check (immediate win/loss at 500,000) or depth limit reached
    if (depth === 0 || Math.abs(currentEval) >= 400000) {
      return currentEval;
    }

    const validMoves = this.getValidMovesOnBoard(board, currentTurnPlayer);
    if (validMoves.length === 0) {
      // Board is completely full: per game rules, Player 2 wins tiebreakers
      return this.player === PLAYER_2 ? 500000 : -500000;
    }

    const nextPlayer = currentTurnPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of validMoves) {
        const clonedBoard = board.clone();
        clonedBoard.setCell(move.row, move.col, currentTurnPlayer);

        const evaluation = this.minimax(clonedBoard, depth - 1, alpha, beta, false, nextPlayer);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) break; // Beta cut-off
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of validMoves) {
        const clonedBoard = board.clone();
        clonedBoard.setCell(move.row, move.col, currentTurnPlayer);

        const evaluation = this.minimax(clonedBoard, depth - 1, alpha, beta, true, nextPlayer);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) break; // Alpha cut-off
      }
      return minEval;
    }
  }

  // Wrapper for external eval(game) calls
  eval(game) {
    return this.evalBoard(game.board);
  }

  // Zero-sum heuristic evaluation on a Board instance
  evalBoard(board) {
    const opponent = this.player === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    const myScore = this.evaluatePlayer(board, this.player);
    if (myScore >= 500000) return 500000;

    const oppScore = this.evaluatePlayer(board, opponent);
    if (oppScore >= 500000) return -500000;

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
            return 500000;
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