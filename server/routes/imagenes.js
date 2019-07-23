const fs = require('fs');
const path = require('path');


const express = require('express');


const { verifyToken } = require('../middlewares/authentication');


const app = express();



app.get('/images/:tipo/:image', verifyToken, (req, res) => {
    const allowedTypes = ['producto', 'usuario'];

    let type = req.params.tipo;

    if (allowedTypes.indexOf(type) === -1) {
        return res.status(400).json({
            ok: false,
            message: 'Error while downloading files',
            err: {
                errors: {
                    id: {
                        message: 'El tipo seleccionado no es permitido'
                    }
                }
            }
        });
    }

    let sendFilePath = '';
    let image = req.params.image;
    let imagePath = path.resolve(__dirname, `../../uploads/${ type }/${ image }`);
    let noImagePath = path.resolve(__dirname, '../assets/img/no-image.jpg');

    sendFilePath = (fs.existsSync(imagePath)) ? imagePath : noImagePath;

    res.sendFile(sendFilePath);
});



module.exports = app;