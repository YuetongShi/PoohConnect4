class Board{
    constructor() {
        this.rows = 6;
        this.cols = 7;

        // Initialize with a 2D array filled with empty, i.e. 0
        this.grid = this.createGrid();
    }

    createGrid() {
        const grid = [];
        for (let r = 0; r < this.rows; r++) {
            grid.push([0, 0, 0, 0, 0, 0, 0]);
        }

        return grid;
    }

    resetGrid(){
        this.grid = this.createGrid();
    }

    isValidPosition(row, col){
        // Row and column index starts from 0, ends at rows - 1 and cols - 1
        return row < this.rows && row >= 0 && col < this.cols && col >= 0;
    }

    getCell(row, col){
        if(!this.isValidPosition(row, col))
            throw new Error("Not a valid position!");

        return this.grid[row][col];
    }

    setCell(row, col,value){
        if(!this.isValidPosition(row, col))
            throw new Error("Not a valid position!");
        else if (value < 0 || value >2)
            throw new Error("Not a valid value!");

        this.grid[row][col] = value;
    }

    // Make a copy for AI player to test the outcome
    clone(){
        const copy = new Board();
        copy.grid = this.grid.map(row => [...row]);
        return copy;
    }
}