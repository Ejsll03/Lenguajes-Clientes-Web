export function transposeMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Crear una matriz vacía para almacenar la traspuesta
    const transposed = [];

    for (let j = 0; j < cols; j++) {
        transposed[j] = []; // Inicializar cada fila de la matriz traspuesta
        for (let i = 0; i < rows; i++) {
            transposed[j][i] = matrix[i][j]; // Intercambiar filas por columnas
        }
    }

    return transposed;
}