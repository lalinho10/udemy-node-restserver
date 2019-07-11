const express = require('express');

const { verifyToken } = require('../middlewares/authentication');
const { verifyAdminRole } = require('../middlewares/faculties');

const Categoria = require('../models/categoria');

const app = express();



/***********************************************************
 * Consulta de categorias
 ***********************************************************/

app.get('/categorias', verifyToken, function(req, res) {
    Categoria.find({}).sort('descripcion').populate('usuario', 'name email').exec((err, categorias) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting categories',
                err
            });
        }

        res.json({
            ok: true,
            categorias: categorias
        });
    });
});

/***********************************************************
 * Consulta de una categoria
 ***********************************************************/

app.get('/categoria/:id', verifyToken, function(req, res) {
    let _id = req.params.id;

    Categoria.findOne({ _id: _id }).populate('usuario', 'nombre email').exec((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting a category',
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                message: 'Error while getting a category',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró alguna categoria con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/***********************************************************
 * Creación de una nueva categoria
 ***********************************************************/

app.post('/categoria', verifyToken, function(req, res) {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while creating a category',
                err
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/***********************************************************
 * Actualización de una categoria
 ***********************************************************/

app.put('/categoria/:id', verifyToken, function(req, res) {
    let id = req.params.id;

    let body = req.body;

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while updating category',
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                message: 'Error while updating category',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró alguna categoria con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/***********************************************************
 * Eliminación de una categoria
 ***********************************************************/

app.delete('/categoria/:id', [verifyToken, verifyAdminRole], function(req, res) {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while deleting category',
                err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                message: 'Error while deleting category',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró alguna categoria con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.json({
            ok: true,
            categoriaBorrada: categoriaBorrada
        });
    });
});

module.exports = app;