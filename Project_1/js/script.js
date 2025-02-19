import { createMatrix, displayMatrix, getMatrixValues } from './module/martixUtils.js';
import { addMatrices } from './module/suma.js';
import { subtractMatrices } from './module/resta.js';
import { multiplyMatrices } from './module/multiplicacion.js';
import { multiplyMatrixByScalar } from './module/escalar.js';
import { transposeMatrix } from './module/traspuesta.js';
import { determinant } from './module/determinante.js';
import { identityMatrix } from './module/identidad.js';
import { inverseMatrix } from './module/inversa.js';

let matrices = {};
let Matrix = [];
let matrixCount = 0;

document.getElementById('createMatrixBtn').addEventListener('click', createNewMatrix);
document.getElementById('deleteMatrixSelect').addEventListener('change', function () {
    if (this.value) {
        deleteSelectedMatrix(this.value);
        this.value = "";
    }
});

const matricesContainer = document.querySelector('.matrices');

function updateMatrixSelect() {
    const deleteMatrixSelect = document.getElementById('deleteMatrixSelect');
    deleteMatrixSelect.innerHTML = '<option value="">Eliminar</option>';
    
    for (let key in matrices) {
        let deleteOption = document.createElement('option');
        deleteOption.value = key;
        deleteOption.textContent = `Matriz ${key}`;
        deleteMatrixSelect.appendChild(deleteOption);
    }
}

function createNewMatrix() {
    if (matrixCount >= 2) {
        alert("Solo se pueden crear dos matrices: A y B.");
        return;
    }
    

    let matrixName = !matrices['A'] ? 'A' : 'B';
    matrixCount++;
    matrices[matrixName] = [];

    const matrixDiv = document.createElement('div');
    matrixDiv.classList.add('matrix');
    matrixDiv.id = `matrixDiv${matrixName}`;
    matrixDiv.innerHTML = `
        <h2>Matriz ${matrixName}</h2>
        <div id="matrix${matrixName}">
            <label>Tamaño de la matriz (NxN): </label>
            <input type="number" id="row${matrixName}" min="1" placeholder="Filas">
            <label>x</label>
            <input type="number" id="col${matrixName}" min="1" placeholder="Columnas">
            <button id="generateMatrix${matrixName}">Generar Matriz ${matrixName}</button>
        </div>
        <div class="scalar-container">
            <button id="scalarMultiplyBtn${matrixName}" style="display: none;">Multiplicar por Escalar</button>
            <input type="number" id="scalarValue${matrixName}" placeholder="Escalar" style="display: none;">
        </div>
        <div class="matrixOperations">
            <button id="transposeBtn${matrixName}" style="display: none;">Traspuesta</button>
            <button id="determinantBtn${matrixName}" style="display: none;">Determinante</button>
            <button id="inverseBtn${matrixName}" style="display: none;">Inversa</button>
            <button id="identityBtn${matrixName}" style="display: none;">Identidad</button>
        </div>`;
    matricesContainer.appendChild(matrixDiv);

    // Asignar evento para generar la matriz
    document.getElementById(`generateMatrix${matrixName}`).addEventListener('click', () => {
        const rows = parseInt(document.getElementById(`row${matrixName}`).value);
        const cols = parseInt(document.getElementById(`col${matrixName}`).value);
        if (isNaN(rows) || isNaN(cols)) {
            alert("Ingresa valores válidos.");
            return;
        }
        matrices[matrixName] = createMatrix(rows, cols);
        displayMatrix(matrices[matrixName], `matrix${matrixName}`);
        document.getElementById(`scalarMultiplyBtn${matrixName}`).style.display = 'inline-block';
        document.getElementById(`scalarValue${matrixName}`).style.display = 'inline-block';
        document.getElementById(`transposeBtn${matrixName}`).style.display = 'inline-block';
        document.getElementById(`determinantBtn${matrixName}`).style.display = 'inline-block';
        document.getElementById(`inverseBtn${matrixName}`).style.display = 'inline-block';
        document.getElementById(`identityBtn${matrixName}`).style.display = 'inline-block';
    });

    // Asignar evento para multiplicar por escalar
    document.getElementById(`scalarMultiplyBtn${matrixName}`).addEventListener('click', () => {
        const scalarValue = parseInt(document.getElementById(`scalarValue${matrixName}`).value);
        if (isNaN(scalarValue)) {
            alert("Ingresa un valor válido para el escalar.");
            return;
        }
        Matrix = getMatrixValues(`matrix${matrixName}`);
        const result = multiplyMatrixByScalar(Matrix, scalarValue);
        displayMatrix(result, `resultMatrix`);
    });

    // Asignar evento para traspuesta
    document.getElementById(`transposeBtn${matrixName}`).addEventListener('click', () => {
        Matrix = getMatrixValues(`matrix${matrixName}`);
        const result = transposeMatrix(Matrix);
        displayMatrix(result, `resultMatrix`);
    });

    // Asignar evento para determinante
    document.getElementById(`determinantBtn${matrixName}`).addEventListener('click', () => {
        Matrix = getMatrixValues(`matrix${matrixName}`);
        const result = determinant(Matrix);
        document.getElementById('resultMatrix').textContent = `Determinante: ${result}`;
    });

    // Asignar evento para inversa
    document.getElementById(`inverseBtn${matrixName}`).addEventListener('click', () => {
        Matrix = getMatrixValues(`matrix${matrixName}`);
        if (Matrix.length !== Matrix[0].length) {
            alert("La matriz debe ser cuadrada para calcular su inversa.");
            return;
        }
        const result = inverseMatrix(Matrix);
        displayMatrix(result, `resultMatrix`);
        
    });

    // Asignar evento para matriz identidad

    document.getElementById(`identityBtn${matrixName}`).addEventListener('click', () => {
        Matrix = getMatrixValues(`matrix${matrixName}`);
    
        if(Matrix.length !== Matrix[0].length) {
            alert("La matriz debe ser cuadrada para calcular su identidad.");
            return;
        } 
    
        const identityMatrixResult = identityMatrix(Matrix.length);
        displayMatrix(identityMatrixResult, 'resultMatrix');
    });
    

    if (matrixCount === 2) {
        document.getElementById('addBtn').style.display = 'inline-block';
        document.getElementById('subtractBtn').style.display = 'inline-block';
        document.getElementById('multiplyBtn').style.display = 'inline-block';
    }

    updateMatrixSelect();
}
function deleteSelectedMatrix(selectedMatrix) {
    if (!selectedMatrix) {
        alert("Selecciona una matriz para eliminar.");
        return;
    }

    delete matrices[selectedMatrix];
    const matrixDiv = document.getElementById(`matrixDiv${selectedMatrix}`);
    if (matrixDiv) matricesContainer.removeChild(matrixDiv);
    matrixCount--;
    if (matrixCount < 2) {
        document.getElementById('addBtn').style.display = 'none';
        document.getElementById('subtractBtn').style.display = 'none';
        document.getElementById('multiplyBtn').style.display = 'none';
    }
    updateMatrixSelect();

    document.getElementById('resultMatrix').textContent = "";
}

// Sumar matrices
document.getElementById('addBtn').addEventListener('click', () => {
    if (!matrices['A'] || !matrices['B']) {
        alert("Debes crear ambas matrices antes de sumar.");
        return;
    }

    const matrixA = getMatrixValues('matrixA');
    const matrixB = getMatrixValues('matrixB');

    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
        alert("Las matrices deben tener el mismo tamaño para sumarse.");
        return;
    }

    const result = addMatrices(matrixA, matrixB);
    displayMatrix(result, 'resultMatrix');
});

// Restar matrices
document.getElementById('subtractBtn').addEventListener('click', () => {
    if (!matrices['A'] || !matrices['B']) {
        alert("Debes crear ambas matrices antes de restar.");
        return;
    }

    const matrixA = getMatrixValues('matrixA');
    const matrixB = getMatrixValues('matrixB');

    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
        alert("Las matrices deben tener el mismo tamaño para restarse.");
        return;
    }

    const result = subtractMatrices(matrixA, matrixB);
    displayMatrix(result, 'resultMatrix');
});

// Multiplicar matrices
document.getElementById('multiplyBtn').addEventListener('click', () => {
    if (!matrices['A'] || !matrices['B']) {
        alert("Debes crear ambas matrices antes de multiplicar.");
        return;
    }

    const matrixA = getMatrixValues('matrixA');
    const matrixB = getMatrixValues('matrixB');

    if (matrixA[0].length !== matrixB.length) {
        alert("El número de columnas de la Matriz A debe coincidir con el número de filas de la Matriz B.");
        return;
    }    

    const result = multiplyMatrices(matrixA, matrixB);
    displayMatrix(result, 'resultMatrix');
});