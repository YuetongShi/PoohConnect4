class Agent {
  // Currently AI only plays as player2, and only randon strategy available
  constructor(player = PLAYER_2, strategy = 'random') {
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

  // Choose move according to strategy, greedy and minimax awaiting update
  chooseMove(game) {
    if (game.gameOver || game.currentPlayer !== this.player) {
      return null;
    }

    switch (this.strategy) {
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
}