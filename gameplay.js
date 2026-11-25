const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 100; // width
const RADIUS = 38;     // radius

function drawBoard() {
  // Board base
  ctx.fillStyle = '#F4A938';
  ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE);

  // Set up board
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const centerX = col * CELL_SIZE + CELL_SIZE / 2;
      const centerY = row * CELL_SIZE + CELL_SIZE / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDF5'; // Background Color
      ctx.fill();

      // Shadow
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#B86B11';
      ctx.stroke();
    }
  }
}

drawBoard();
