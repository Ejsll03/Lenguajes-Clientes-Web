
import { determinant } from "./determinante.js";
export function inverseMatrix(matrix) {
    const n = matrix.length;

    // Verificar si la matriz es cuadrada
    if (n !== matrix[0].length) {
        alert("La matriz debe ser cuadrada para calcular su inversa.");
        return null;
    }

    // Calcular el determinante
    const det = determinant(matrix);
    if (det === 0) {
        alert("La matriz no tiene inversa (determinante es 0).");
        return null;
    }
    if (det < 0){
        alert("La matriz no tiene inversa (determinante es negativo).");
        return null;
    }

    // Crear una matriz aumentada [matrix | I]
    let augmentedMatrix = [];
    for (let i = 0; i < n; i++) {
        augmentedMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            augmentedMatrix[i][j] = matrix[i][j]; // Copia de la matriz original
        }
        for (let j = 0; j < n; j++) {
            augmentedMatrix[i][j + n] = (i === j) ? 1 : 0; // Matriz identidad
        }
    }

    // Aplicar el método de Gauss-Jordan
    for (let i = 0; i < n; i++) {
        // Hacer el pivote 1
        let pivot = augmentedMatrix[i][i];
        if (pivot === 0) {
            // Buscar una fila para intercambiar
            for (let j = i + 1; j < n; j++) {
                if (augmentedMatrix[j][i] !== 0) {
                    // Intercambiar filas
                    [augmentedMatrix[i], augmentedMatrix[j]] = [augmentedMatrix[j], augmentedMatrix[i]];
                    pivot = augmentedMatrix[i][i];
                    break;
                }
            }
            if (pivot === 0) {
                alert("No se puede calcular la inversa (pivote 0).");
                return null;
            }
        }

        // Dividir la fila por el pivote
        for (let j = 0; j < 2 * n; j++) {
            augmentedMatrix[i][j] /= pivot;
        }

        // Hacer ceros en las otras filas
        for (let j = 0; j < n; j++) {
            if (j !== i) {
                const factor = augmentedMatrix[j][i];
                for (let k = 0; k < 2 * n; k++) {
                    augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
                }
            }
        }
    }

    // Extraer la matriz inversa
    const inverse = [];
    for (let i = 0; i < n; i++) {
        inverse[i] = [];
        for (let j = 0; j < n; j++) {
            inverse[i][j] = augmentedMatrix[i][j + n];
        }
    }

    return inverse;
}