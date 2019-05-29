require('./config/config');

const bodyParser = require('body-parser');
const express = require('express');



const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.json('Bienevenida');
});

app.get('/usuario', function(req, res) {
    res.json({ type: 'get', path: 'usuario' });
});

app.post('/usuario', function(req, res) {
    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({ ok: false, mensaje: `Missing parameter 'nombre'` });
    } else {
        res.json({ type: 'post', path: 'usuario', body });
    }
});

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;

    res.json({ type: 'put', path: 'usuario', id });
});

app.delete('/usuario', function(req, res) {
    res.json({ type: 'delete', path: 'usuario' });
});



app.listen(process.env.PORT, () => {
    console.log(`Escuchando peticiones en el puerto ${ process.env.PORT }`);
});