const fs = require('fs');
const path = require('path');


const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');


const { verifyToken } = require('../middlewares/authentication');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');


const app = express();

app.use(fileUpload());



app.put('/upload/:tipo/:id', verifyToken, function(req, res) {
    const allowedExts = ['png', 'jpg', 'jpeg', '.gif'];
    const allowedTypes = ['producto', 'usuario'];

    let id = req.params.id;
    let type = req.params.tipo;

    if (allowedTypes.indexOf(type) === -1) {
        return res.status(400).json({
            ok: false,
            message: 'Error while uploading files',
            err: {
                errors: {
                    id: {
                        message: 'El tipo seleccionado no es permitido'
                    }
                }
            }
        });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            ok: false,
            message: 'Error while uploading files',
            err: {
                errors: {
                    id: {
                        message: 'El ID selecciondo no es válido'
                    }
                }
            }
        });
    }

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            message: 'Error while uploading files',
            err: {
                errors: {
                    id: {
                        message: 'No hay archivos para cargar'
                    }
                }
            }
        });
    }

    let file = req.files.archivo;
    let fileExt = file.name.split('.').pop();

    if (allowedExts.indexOf(fileExt) === -1) {
        return res.status(400).json({
            ok: false,
            message: 'Error while uploading files',
            err: {
                errors: {
                    id: {
                        message: 'El tipo de archivo seleccionado no es permitido'
                    }
                }
            }
        });
    }

    let serverFileName = `${ id }-${ new Date().getTime() }.${ fileExt }`;

    file.mv(`uploads/${ type }/${ serverFileName }`, function(err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while uploading files',
                err
            });
        }

        if (type === 'usuario') {
            updateUserImage(id, serverFileName, res);
        } else if (type === 'producto') {
            updateProductImage(id, serverFileName, res);
        }
    });
});


function updateUserImage(idUser, imageName, res) {
    Usuario.findById(idUser, (err, usuarioDB) => {
        if (err) {
            removeImageFromFS(imageName, 'usuario');

            return res.status(500).json({
                ok: false,
                message: 'Error while getting a user',
                err
            });
        }

        if (!usuarioDB) {
            removeImageFromFS(imageName, 'usuario');

            return res.status(400).json({
                ok: false,
                message: 'Error while getting a user',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún usuario con el ID proporcionado'
                        }
                    }
                }
            });
        }

        removeImageFromFS(usuarioDB.image, 'usuario');

        usuarioDB.image = imageName;

        usuarioDB.save((err, usuarioUpd) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while creating a user',
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioUpd
            });
        });
    });
}

function updateProductImage(idProduct, imageName, res) {
    Producto.findById(idProduct, (err, productoDB) => {
        if (err) {
            removeImageFromFS(imageName, 'producto');

            return res.status(500).json({
                ok: false,
                message: 'Error while getting a product',
                err
            });
        }

        if (!productoDB) {
            removeImageFromFS(imageName, 'producto');

            return res.status(400).json({
                ok: false,
                message: 'Error while getting a product',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún producto con el ID proporcionado'
                        }
                    }
                }
            });
        }

        removeImageFromFS(productoDB.image, 'producto');
        productoDB.image = imageName;

        productoDB.save((err, productoUpd) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while creating a product',
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoUpd
            });
        });

    });
}

function removeImageFromFS(imageName, type) {
    let imagePath = path.resolve(__dirname, `../../uploads/${ type }/${ imageName }`);

    if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath);
    }
}



module.exports = app;