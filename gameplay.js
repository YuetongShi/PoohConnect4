const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 100;
const RADIUS = 38;

// Parse URL query parameter (?mode=single or ?mode=double)
const urlParams = new URLSearchParams(window.location.search);
const gameMode = urlParams.get('mode') || 'double';

// Initialize backend game engine & AI agent (Tigger plays as PLAYER_2)
const game = new Game();
const aiAgent = gameMode === 'single' ? new Agent(PLAYER_2, 'random') : null;
let isAITurn = false; // Prevent human clicks while AI is thinking/moving

// Load character piece images
const poohImg = new Image();
poohImg.src = 'Graphics/pooh_face.png';

const tiggerImg = new Image();
tiggerImg.src = 'Graphics/tigger_face.png';

// Track mouse hover & falling animation state
let hoverTarget = null;   // { row, col } in backend coordinates
let fallingPiece = null;  // { player, targetRow, col, currentY, targetY, velocity }

// Helper: Convert backend row (0 at bottom) to canvas Y center (0 at top)
function getCanvasY(backendRow) {
  const canvasRow = ROWS - 1 - backendRow;
  return canvasRow * CELL_SIZE + CELL_SIZE / 2;
}

// Helper: Convert column to canvas X center
function getCanvasX(col) {
  return col * CELL_SIZE + CELL_SIZE / 2;
}

// Helper: Find the lowest valid backend row in a given column using backend rules
function findDropRow(col) {
  for (let r = 0; r < ROWS; r++) {
    if (game.isValidMove(game.currentPlayer, r, col)) {
      return r;
    }
  }
  return -1;
}

// Helper: Draw a circular clipped character face at (x, y)
function drawPiece(player, x, y) {
  const img = player === PLAYER_1 ? poohImg : tiggerImg;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, RADIUS - 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip(); // Clip image neatly inside the circular slot

  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x - RADIUS, y - RADIUS, RADIUS * 2, RADIUS * 2);
  } else {
    // Fallback color if image is still loading
    ctx.fillStyle = player === PLAYER_1 ? '#FFD15C' : '#FF7B29';
    ctx.fill();
  }
  ctx.restore();
}

// Helper: Trigger free-fall animation for any move (human or AI)
function startDropAnimation(targetRow, col) {
  fallingPiece = {
    player: game.currentPlayer,
    targetRow: targetRow,
    col: col,
    currentY: -RADIUS,
    targetY: getCanvasY(targetRow),
    velocity: 0
  };

  hoverTarget = null;
  canvas.style.cursor = 'default';
  requestAnimationFrame(animateDrop);
}

// Trigger AI agent's turn with a short natural delay
function triggerAITurn() {
  if (!aiAgent || game.gameOver || game.currentPlayer !== aiAgent.player) return;

  isAITurn = true;
  setTimeout(() => {
    const move = aiAgent.chooseMove(game);
    isAITurn = false;
    if (move) {
      startDropAnimation(move.row, move.col);
    }
  }, 350); // 350ms pause so Tigger's move feels natural
}

// Render the entire board, pieces, hover highlight, and active falling animation
function render() {
  // 1. Honey board base
  ctx.fillStyle = '#F4A938';
  ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);

  // 2. Draw empty slots & settled pieces from backend board
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const centerX = getCanvasX(c);
      const centerY = getCanvasY(r);

      const isHoveredValidSlot =
        hoverTarget &&
        hoverTarget.row === r &&
        hoverTarget.col === c &&
        !fallingPiece &&
        !isAITurn &&
        !game.gameOver;

      // Empty slot background
      ctx.beginPath();
      ctx.arc(centerX, centerY, RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDF5';
      ctx.fill();

      // Highlight valid drop target in Winnie's warm honey yellow
      if (isHoveredValidSlot) {
        ctx.fillStyle = 'rgba(255, 209, 92, 0.55)';
        ctx.fill();
      }

      // Draw settled piece if cell is occupied
      const cellValue = game.board.getCell(r, c);
      if (cellValue !== EMPTY) {
        drawPiece(cellValue, centerX, centerY);
      }

      // Slot border shadow (thick golden-brown ring when highlighted)
      ctx.beginPath();
      ctx.arc(centerX, centerY, RADIUS, 0, Math.PI * 2);
      ctx.lineWidth = isHoveredValidSlot ? 4 : 3;
      ctx.strokeStyle = isHoveredValidSlot ? '#E08E0B' : '#B86B11';
      ctx.stroke();
    }
  }

  // 3. Draw currently falling piece during free-fall animation
  if (fallingPiece) {
    const x = getCanvasX(fallingPiece.col);
    drawPiece(fallingPiece.player, x, fallingPiece.currentY);
  }
}

// Free-fall animation loop using gravity acceleration
function animateDrop() {
  if (!fallingPiece) return;

  const gravity = 1.8; // Acceleration per frame
  fallingPiece.velocity += gravity;
  fallingPiece.currentY += fallingPiece.velocity;

  // Check if piece reached its target slot
  if (fallingPiece.currentY >= fallingPiece.targetY) {
    const { targetRow, col } = fallingPiece;
    fallingPiece = null;

    // Update backend state once the piece lands
    game.runTurn(targetRow, col);
    const winner = game.updateWinner();

    render();

    if (winner !== EMPTY) {
      const winnerName = winner === PLAYER_1 ? 'Pooh' : 'Tigger';
      setTimeout(() => alert(`${winnerName} wins!`), 50);
      return;
    }

    // If Single Player mode and it's now AI's turn, let Tigger play!
    if (gameMode === 'single' && game.currentPlayer === aiAgent.player) {
      triggerAITurn();
    }
    return;
  }

  render();
  requestAnimationFrame(animateDrop);
}

// Mouse move: highlight ONLY when the cursor is directly over the exact valid drop slot
canvas.addEventListener('mousemove', (e) => {
  if (game.gameOver || fallingPiece || isAITurn) {
    canvas.style.cursor = 'default';
    hoverTarget = null;
    render();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const col = Math.floor(mouseX / CELL_SIZE);
  const canvasRow = Math.floor(mouseY / CELL_SIZE);
  const hoveredBackendRow = ROWS - 1 - canvasRow;

  if (col >= 0 && col < COLS && hoveredBackendRow >= 0 && hoveredBackendRow < ROWS) {
    const validDropRow = findDropRow(col);

    // Only highlight and show hand cursor if hovering over the exact valid landing slot
    if (validDropRow !== -1 && hoveredBackendRow === validDropRow) {
      hoverTarget = { row: validDropRow, col };
      canvas.style.cursor = 'pointer';
      render();
      return;
    }
  }

  // Otherwise keep normal arrow cursor and no highlight
  hoverTarget = null;
  canvas.style.cursor = 'default';
  render();
});

// Clear highlight when mouse leaves the canvas
canvas.addEventListener('mouseleave', () => {
  hoverTarget = null;
  canvas.style.cursor = 'default';
  render();
});

// Click: trigger free-fall drop only when clicking a valid drop slot on human's turn
canvas.addEventListener('click', (e) => {
  if (game.gameOver || fallingPiece || isAITurn) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const col = Math.floor(mouseX / CELL_SIZE);
  const canvasRow = Math.floor(mouseY / CELL_SIZE);
  const clickedBackendRow = ROWS - 1 - canvasRow;

  if (col < 0 || col >= COLS || clickedBackendRow < 0 || clickedBackendRow >= ROWS) return;

  const targetRow = findDropRow(col);
  // Only drop if the clicked cell is the exact valid slot
  if (targetRow === -1 || clickedBackendRow !== targetRow) return;

  startDropAnimation(targetRow, col);
});

// Ensure board renders once images finish loading
poohImg.onload = render;
tiggerImg.onload = render;
render();