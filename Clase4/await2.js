async function tareaConReturn() {
    console.log("Tarea iniciada...");
    return new Promise((resolve) => setTimeout(() => resolve("Tarea completada"), 2000));
}

ejecutarTarea();

// Con then
tareaConReturn().then((resultado) => {
    //console.log("Resultado de la tarea:", resultado);
    console.log("Tarea terminada con then");
});


// Con await
async function ejecutarTarea() {
    console.log("Comenzando la tarea con 'await'...");
    const resultado = await tareaConReturn();
    console.log("Resultado de la tarea:", resultado);
    console.log("Tarea terminada con await" );
}





