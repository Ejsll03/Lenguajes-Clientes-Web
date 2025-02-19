export function determinant(matrix) {
    const n = matrix.length;

    // Caso base: matriz 1x1
    if (n === 1) {
        return matrix[0][0];
    }

    // Caso base: matriz 2x2
    if (n === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    // Caso general: matrices de tamaño nxn (n > 2)
    let det = 0;

    for (let col = 0; col < n; col++) {
        // Obtener el cofactor de la primera fila y la columna actual
        const cofactor = matrix[0][col] * getCofactor(matrix, 0, col);

        // Alternar el signo según la posición (regla de los signos para cofactores)
        det += (col % 2 === 0 ? 1 : -1) * cofactor;
    }

    return det;
}

// Función auxiliar para obtener el cofactor
function getCofactor(matrix, row, col) {
    const subMatrix = [];

    for (let i = 1; i < matrix.length; i++) {
        const newRow = [];
        for (let j = 0; j < matrix[i].length; j++) {
            if (j !== col) {
                newRow.push(matrix[i][j]);
            }
        }
        subMatrix.push(newRow);
    }

    return determinant(subMatrix); // Llamada recursiva para calcular el determinante del cofactor
}