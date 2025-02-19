export function createMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push("");
        }
        matrix.push(row);
    }
    return matrix;
}

export function displayMatrix(matrix, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    matrix.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        row.forEach((cell, colIndex) => {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = cell;
            input.dataset.row = rowIndex;
            input.dataset.col = colIndex;
            rowDiv.appendChild(input);
        });
        container.appendChild(rowDiv);
    });
}

export function getMatrixValues(containerId) {
    const container = document.getElementById(containerId);
    const inputs = container.getElementsByTagName('input');
    const matrix = [];
    for (let input of inputs) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        if (!matrix[row]) {
            matrix[row] = [];
        }
        matrix[row][col] = parseFloat(input.value);
    }
    return matrix;
}