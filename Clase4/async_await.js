// archivo_async_await_claro.js

// 1. Explicación:
// Este archivo tiene un ejemplo muy sencillo de cómo usar 'async' y 'await' para asegurar que las tareas se ejecuten de forma secuencial.
// Las funciones 'async' devuelven siempre una promesa, y con 'await' esperamos que esa promesa se resuelva antes de seguir adelante.

console.log("Iniciando el ejemplo con 'async' y 'await'...");

// 2. Función 'async' sincrónica que simula una tarea
// Esta función simula una tarea que toma tiempo (por ejemplo, una consulta a la base de datos o un proceso de cálculo).

async function tareaUno() {
    console.log("Tarea 1 iniciada...");
    await new Promise((resolve) => setTimeout(() => resolve(1), 2000));  // Espera 2 segundos
    console.log("Tarea 1 completada.");
}

// 3. Función 'async' que simula otra tarea que toma tiempo
async function tareaDos() {
    console.log("Tarea 2 iniciada...");
    await new Promise((resolve) => setTimeout(() => resolve(2), 1000));  // Espera 1 segundo
    console.log("Tarea 2 completada.");
}

// 4. Función principal que maneja las tareas en secuencia usando 'await'
async function ejecutarTareasSecuenciales() {
    console.log("Comenzando las tareas secuenciales...");

    // Llamamos a las tareas con 'await' para esperar que cada una termine antes de pasar a la siguiente
    const primera = await tareaUno();  // Espera a que tareaUno termine antes de pasar a la siguiente
    const segunda = await tareaDos();  // Espera a que tareaDos termine después de que tareaUno termine

    console.log("Todas las tareas completadas.");
    console.log("Resultado de la tarea 1:", primera);
    console.log("Resultado de la tarea 2:", segunda);
}

// 5. Ejecutando la función principal
ejecutarTareasSecuenciales();  // Inicia el flujo secuencial de tareas

console.log("Fin del ejemplo con 'async' y 'await'.");