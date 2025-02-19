export function multiplyMatrixByScalar(matrix, scalar) {
    const result = [];

    for (let i = 0; i < matrix.length; i++) {
        result[i] = [];
        for (let j = 0; j < matrix[i].length; j++) {
            //result.push(matrix[i][j] * scalar);
            result[i][j] = matrix[i][j] * scalar;
        }
    }
    return result;

}