// fetch-example.js

// Realizando una solicitud GET con fetch
fetch('https://jsonplaceholder.typicode.com/users')
  .then(response => {
    // Comprobar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error('No se pudo obtener los datos');
    }
    // Convertir la respuesta a JSON
    return response.json();
  })
  .then(data => {
    // Mostrar los datos en la consola
    console.log(data);
    
    // Mostrar los datos en la página HTML
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = JSON.stringify(data, null, 2);
  })
  .catch(error => {
    // Capturar y mostrar errores
    console.error('Error:', error);
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Hubo un error al cargar los datos.';
  });
