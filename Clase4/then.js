// archivo_promesas.js

// 1. Introducción a las promesas en JavaScript
// Las promesas son una forma de manejar operaciones asíncronas. Una promesa es un objeto que puede tener tres estados:
// - Pendiente (Pending): la operación no se ha completado aún.
// - Resuelta (Fulfilled): la operación se completó exitosamente.
// - Rechazada (Rejected): la operación no pudo completarse con éxito.

console.log("Iniciando el ejemplo de promesas con diferentes tiempos...");

// 2. Crear funciones que simulan operaciones asíncronas con diferentes tiempos
// Estas funciones devolverán promesas que resuelven o rechazan después de un tiempo variable.

function realizarOperacionRapida(operacion) {
    return new Promise((resolve, reject) => {
        console.log("Ejecutando la operación rápida...");
        
        setTimeout(() => {
            if (operacion === "exito") {
                resolve("La operación rápida se completó con éxito.");
            } else {
                reject("Hubo un error en la operación rápida.");
            }
        }, 1000);  // Retraso de 1 segundo
    });
}

function realizarOperacionLarga(operacion) {
    return new Promise((resolve, reject) => {
        console.log("Ejecutando la operación larga...");
        
        setTimeout(() => {
            if (operacion === "exito") {
                resolve("La operación larga se completó con éxito.");
            } else {
                reject("Hubo un error en la operación larga.");
            }
        }, 5000);  // Retraso de 5 segundos
    });
}

// 3. Uso de las promesas con .then() y .catch()

// Llamada a la función con una operación rápida exitosa
realizarOperacionRapida("exito")
    .then((mensaje) => {
        // Si la promesa se resuelve exitosamente, .then() maneja la respuesta
        console.log("Éxito (rápida):", mensaje);
    })
    .catch((error) => {
        // Si la promesa es rechazada, .catch() maneja el error
        console.log("Error (rápida):", error);
    });

// Llamada a la función con una operación rápida fallida
realizarOperacionRapida("fallo")
    .then((mensaje) => {
        console.log("Éxito (rápida):", mensaje);
    })
    .catch((error) => {
        console.log("Error (rápida):", error);
    });

// Llamada a la función con una operación larga exitosa
realizarOperacionLarga("exito")
    .then((mensaje) => {
        // Si la promesa se resuelve exitosamente, .then() maneja la respuesta
        console.log("Éxito (larga):", mensaje);
    })
    .catch((error) => {
        // Si la promesa es rechazada, .catch() maneja el error
        console.log("Error (larga):", error);
    });

// Llamada a la función con una operación larga fallida
realizarOperacionLarga("fallo")
    .then((mensaje) => {
        console.log("Éxito (larga):", mensaje);
    })
    .catch((error) => {
        console.log("Error (larga):", error);
    });

// 4. Resumen
// Las promesas son muy útiles para manejar operaciones asíncronas, como peticiones HTTP, lectura de archivos, entre otras.
// - .then() se usa para manejar el éxito de la promesa (cuando se resuelve).
// - .catch() se usa para manejar los errores (cuando la promesa es rechazada).
// En este ejemplo, hemos visto cómo las promesas pueden manejar operaciones que tardan diferentes tiempos.
// También hemos utilizado .then() y .catch() para procesar los resultados de esas promesas.
