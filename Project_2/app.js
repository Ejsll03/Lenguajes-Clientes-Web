const API_URL = "https://jsonplaceholder.typicode.com/todos";

let ultimoId = 0; 

// Cargar todas las tareas al iniciar
document.addEventListener("DOMContentLoaded", cargarTareas);

function mostrarToast(mensaje, tipo = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

async function cargarTareas() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const tareas = await response.json();
        
        tareas.reverse().forEach(tarea => { // Revertimos el orden
            agregarTareaDOM(tarea);
            if (tarea.id > ultimoId) {
                ultimoId = tarea.id;
            }
        });

        mostrarToast(`Se han cargado ${tareas.length} tareas.`, "success");
    } catch (error) {
        console.error("Error al cargar tareas:", error);
        mostrarToast("Error al cargar tareas.", "error");
    }
}

function agregarTareaDOM(tarea) {
    const lista = tarea.completed ? document.getElementById("completed-list") : document.getElementById("pending-list");

    const li = document.createElement("li");
    li.classList.add("task-item");

    li.innerHTML = `
        <label class="custom-checkbox">
            <input type="checkbox" ${tarea.completed ? "checked" : ""} onclick="cambiarEstado(this, ${tarea.id}, '${tarea.title}')">
            <span class="checkmark"></span>
        </label>
        <span class="task-text ${tarea.completed ? 'completed' : ''}">${tarea.title}</span>
        <button class="delete-btn" onclick="confirmarEliminacion(this.parentElement, ${tarea.id}, '${tarea.title}')">✖</button>
    `;//    <span class="task-id">${tarea.id}.-</span> -> si quiero mostrar el id de la tarea

    lista.prepend(li); // Agregar al inicio en lugar de al final
}

async function crearTarea() {
    const input = document.getElementById("newTask");
    if (!input.value.trim()) return;

    const nuevaTarea = { id: ++ultimoId, title: input.value, completed: false };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaTarea),
        });

        if (!response.ok) {
            throw new Error("Error al agregar tarea");
        }

        const tareaCreada = await response.json();
        tareaCreada.id = ultimoId; // Asegurar que el ID se mantiene
        agregarTareaDOM(tareaCreada);
        input.value = "";
        
        mostrarToast(`Tarea creada: ${tareaCreada.id} - ${tareaCreada.title}.`, "success");
    } catch (error) {
        console.error("Error al crear tarea:", error);
        mostrarToast("Error al crear tarea.", "error");
    }
}

function cambiarEstado(checkbox, id, title) {
    const li = checkbox.closest(".task-item"); // Obtener el <li>
    const listaPendientes = document.getElementById("pending-list");
    const listaCompletadas = document.getElementById("completed-list");

    if (checkbox.checked) {
        li.querySelector(".task-text").classList.add("completed");
        listaCompletadas.prepend(li); // Mover a Completados y poner arriba
        mostrarToast(`Tarea completada: ${id} - ${title}.`, "info");
    } else {
        li.querySelector(".task-text").classList.remove("completed");
        listaPendientes.prepend(li); // Mover a Pendientes y poner arriba
        mostrarToast(`Tarea marcada como pendiente: ${id} - ${title}.`, "warning");
    }
}

function confirmarEliminacion(tareaElemento, id, title) {
    const confirmBox = document.createElement("div");
    confirmBox.className = "confirm-box";
    confirmBox.innerHTML = `
        <p>¿Seguro que quieres eliminar la tarea: "${title}"?</p>
        <button class="confirm-btn">Sí</button>
        <button class="cancel-btn">No</button>
    `;
    document.body.appendChild(confirmBox);

    // Cerrar el cuadro de confirmación cuando se elige "Sí" o "No"
    const confirmBtn = confirmBox.querySelector(".confirm-btn");
    const cancelBtn = confirmBox.querySelector(".cancel-btn");

    confirmBtn.addEventListener("click", () => {
        eliminarTarea(id, title, tareaElemento); // Eliminar la tarea
        confirmBox.remove(); // Cerrar el cuadro de confirmación
    });

    cancelBtn.addEventListener("click", () => {
        confirmBox.remove(); // Cerrar el cuadro de confirmación sin eliminar la tarea
    });
}

async function eliminarTarea(id, title, tareaElemento) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Error al eliminar tarea");
        }

        tareaElemento.remove(); // Elimina la tarea de la lista
        mostrarToast(`Tarea eliminada: ${id} - ${title}.`, "error");
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        mostrarToast("Error al eliminar tarea.", "error");
    }
}