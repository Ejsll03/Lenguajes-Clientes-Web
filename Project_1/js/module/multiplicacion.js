export function multiplyMatrices(matrixA, matrixB) {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;
  
    if (colsA !== rowsB) {
        throw new Error("El número de columnas de la matriz A debe ser igual al número de filas de la matriz B.");
    }
  
    // Inicializar la matriz resultado con ceros
    const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
  
    // Multiplicar matrices
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            for (let k = 0; k < colsA; k++) {
                result[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }
  
    return result;
  }
  