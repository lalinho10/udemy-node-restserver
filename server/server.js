require('./config/config');

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');



const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('./routes/index'));



app.use(express.static(path.resolve(__dirname, '../public')));



const connectionOptions = {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true
};

mongoose.connect(process.env.DB_CONNECTION, connectionOptions, (err, res) => {
    if (err) throw err;

    console.log('Conectado a la BD');
});



app.listen(process.env.PORT, () => {
    console.log(`Escuchando peticiones en el puerto ${ process.env.PORT }`);
});