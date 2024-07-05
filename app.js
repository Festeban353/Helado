//Libreria de Express
const express = require('express');
//Libreria Path
const path = require('path');
//Libreria Mysql
const mysql = require('mysql');
// Libreria Multer
const multer = require('multer');

const app = express();
const port = 3000;

// Configuración de multer para el manejo de archivos
const upload = multer({ dest: 'imagenes/' });

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Heladeria'
});
//Verificacion de errores para validar si la conexion es correcta
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});
//Envio los datos del formulario por url
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos de la carpeta 'imagenes'
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
//Convierto en formato json
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));
//Recibo los valores y los envio a la tabla
app.post('/guardar_helado',(req, res) => {
    const { nombre, descripcion, sabor, tipo, cobertura, precio } = req.body;
    const sql = 'INSERT INTO Helado (nombre, descripcion, sabor, tipo, cobertura, precio) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, descripcion, sabor, tipo, cobertura, precio], (err, result) => {
        if (err) throw err;
        console.log('Helado insertado correctamente.');
        res.redirect('/listardatos.html');
    });
});
//Ruta para mostrar los helados en el listardatos.html con metodo GET
app.get('/helados', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "helados"
    connection.query('SELECT * FROM Helado', (err, rows) => {
        //Maneja los errores, si los hay
        if (err) throw err;
        res.send(rows); //Aquí puedes enviar la respuesta como quieras (por ejemplo, renderizar un HTML o enviar un JSON)
    });
});


//Define una ruta DELETE en la aplicación Express para eliminar un juego por su ID
app.delete('/eliminar_helado/:id', (req, res) => {
    //Obtiene el parámetro 'id' de la URL para eliminar un juego en especifico
    const id = req.params.id;
    //Define la consulta SQL para eliminar un juego donde el ID coincida
    const sql = 'DELETE FROM Helado WHERE id = ?';
    //Ejecuta la consulta SQL, utilizando el Id que se enviara a la consulta SQL
    connection.query(sql, [id], (err, result) => {
        // Si ocurre un error durante la ejecución de la consulta, lanza una excepción
        if (err) throw err;
        // Imprime un mensaje en la consola indicando que el juego fue eliminada correctamente
        console.log('Helado eliminado correctamente.');
        // Envía una respuesta HTTP 200 OK al cliente, indicando que la eliminación fue exitosa
        res.sendStatus(200); 
    });
});


// Ruta para obtener los datos de una película por su ID
app.get('/helado_especifico/:id', (req, res) => {
    // Extraer el ID de los parámetros de la solicitud
    const id = req.params.id;
    // Ejecutar una consulta SQL para obtener los datos de la película con el ID proporcionado
    connection.query('SELECT * FROM Helado WHERE id = ?', [id], (err, result) => {
        if (err) {
            // Manejar el error si ocurre durante la consulta
            console.error('Error al obtener los datos del helado:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        // Verificar si no se encontró ninguna película con el ID proporcionado
        if (result.length === 0) {
            res.status(404).send('Helado no encontrado');
            return;
        }
        // Enviar los datos de la película como respuesta en formato JSON
        res.json(result[0]);
    });
});

app.post('/iniciar_sesion', (req, res) => {
    const { correo, contraseña } = req.body;

    const query = 'SELECT rol FROM Usuario WHERE correo = ? AND contraseña = ?';
    connection.query(query, [correo, contraseña], (err, results) => {
        if (err) {
            console.error('Error al iniciar sesión:', err);
            res.status(500).send('Error al iniciar sesión');
        } else if (results.length > 0) {
            const rol = results[0].Rol;
            if (rol === 1) {
                res.send('/listardatos.html');
            } else if (rol === 2) {
                res.send('/usuario.html');
            }
        } else {
            res.status(401).send('Correo o clave incorrectos');
        }
    });
});


//Recibo los valores y los envio a la tabla
app.post('/guardar_usuarios',(req, res) => {
    const { nombre, correo, contraseña, rol } = req.body;
    const sql = 'INSERT INTO Usuario (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)';
    connection.query(sql, [nombre, correo, contraseña, rol], (err, result) => {
        if (err) throw err;
        console.log('usuario insertado correctamente.');
        res.redirect('/index.html');
    });
});


//Ruta para mostrar los usuarios con el metodo GET
app.get('/usuarios', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "usuarios"
    connection.query('SELECT * FROM Usuario', (err, rows) => {
        //Maneja los errores, si los hay
        if (err) throw err;
        res.send(rows); //Aquí puedes enviar la respuesta como quieras (por ejemplo, renderizar un HTML o enviar un JSON)
    });
});

// Ruta para obtener los datos de un usuario por su ID
app.get('/usuarios/:id', (req, res) => {
    // Extraer el ID de los parámetros de la solicitud
    const id = req.params.id;
    // Ejecutar una consulta SQL para obtener los datos de los usuarios con el ID proporcionado
    connection.query('SELECT * FROM Helado WHERE idusuario = ?', [id], (err, result) => {
        if (err) {
            // Manejar el error si ocurre durante la consulta
            console.error('Error al obtener los datos del usuario:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        // Verificar si no se encontró ningun usuario con el ID proporcionado
        if (result.length === 0) {
            res.status(404).send('usuario no encontrado');
            return;
        }
        // Enviar los datos del usuario como respuesta en formato JSON
        res.json(result[0]);
    });
});

// Ruta para manejar la subida de imágenes
app.post('/subir_imagenes', upload.single('imagen'), (req, res) => {
    // Extrae 'nombre' del cuerpo de la solicitud
    const {nombreimagen} = req.body;
    // Extrae el nombre del archivo subido desde la solicitud
    const imagen = req.file.filename;
    // Define la consulta SQL para insertar los datos en la tabla 'imagenes'
    const query = 'INSERT INTO Imagenes (nombreimagen, imagen) VALUES (?, ?)';
    // Ejecuta la consulta SQL con los valores extraídos
    connection.query(query, [nombreimagen, imagen], (err) => {
        // Si hay un error, lanza una excepción
        if (err) throw err;
        // Si la inserción es exitosa, redirige al usuario a la página principal
        res.redirect('/imagenes.html');
    });
});

// Ruta para obtener las imágenes
app.get('/imagenes', (req, res) => {
    const query = 'SELECT nombreimagen, imagen FROM Imagenes';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los datos de la base de datos: ' + err.stack);
            res.status(500).send('Error al obtener los datos de la base de datos.');
            return;
        }
        res.json(results);
    });
});


//Servidor ejecutandose en el puerto 3000
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

