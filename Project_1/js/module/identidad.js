export function identityMatrix(n) {
    const matrix = [];
    for (let i = 0; i < n; i++) {
        matrix[i] = [];
        for (let j = 0; j < n; j++) {
            matrix[i][j] = i === j ? 1 : 0;
        }
    }
    return matrix;
}