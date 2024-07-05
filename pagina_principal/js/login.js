document.getElementById("FormularioAcceso").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita el envío del formulario por defecto


    // Envío de datos al servidor
    fetch('/iniciar_sesion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo: correo, contraseña: contraseña })
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Correo o clave incorrectos');
            }
        })
        .then(data => {
            if (data.includes('listardatos.html')) {
                window.location.href = '/listardatos.html';
            } else if (data.includes('usuario.html')) {
                window.location.href = '/usuario.html';
            } else {
                alert('Correo o clave incorrectos');
            }
        })
        .catch(error => {
            console.error('Error al iniciar sesión:', error);
        });
});