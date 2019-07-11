const express = require('express');
const _ = require('underscore');

const { verifyToken } = require('../middlewares/authentication');

const Categoria = require('../models/categoria');
const Producto = require('../models/producto');

const app = express();



/***********************************************************
 * Consulta de productos
 ***********************************************************/

app.get('/productos', verifyToken, function(req, res) {
    let pagina = req.query.pagina || 0;
    pagina = Number(pagina);

    if (pagina <= 0) {
        return res.status(406).json({
            ok: false,
            message: 'Error while getting products',
            err: {
                errors: {
                    pagina: {
                        message: `El parámetro 'página' debe ser mayor a 0`
                    }
                }
            }
        });
    }

    let regspp = req.query.regspp || 5;
    regspp = Number(regspp);

    if (regspp <= 0) {
        return res.status(406).json({
            ok: false,
            message: 'Error while getting products',
            err: {
                errors: {
                    regspp: {
                        message: `El parámetro 'registros por página' debe ser mayor a 0`
                    }
                }
            }
        });
    }

    let offset = (pagina - 1) * regspp;

    Producto.find({ disponible: true }).skip(offset).limit(regspp).populate('usuario', 'name email').populate('categoria', 'descripcion').exec((err, productos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting products',
                err
            });
        }

        Producto.countDocuments({ disponible: true }, (err, numProductos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while getting products',
                    err
                });
            }

            let limInf = offset + 1;
            let limSupTemp = (offset + regspp);
            let limSup = (limSupTemp > numProductos) ? numProductos : limSupTemp;

            let responseObject = {};

            if (productos.length > 0) {
                responseObject = {
                    ok: true,
                    productos: productos,
                    desde: limInf,
                    hasta: limSup,
                    total: numProductos
                };
            } else {
                responseObject = {
                    ok: true,
                    productos: productos
                }
            }

            res.json(responseObject);
        });
    });
});

/***********************************************************
 * Consulta de un producto
 ***********************************************************/

app.get('/producto/:id', verifyToken, function(req, res) {
    let _id = req.params.id;

    Producto.findOne({ _id: _id }).populate('usuario', 'name email').populate('categoria', 'descripcion').exec((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting a product',
                err
            });
        }

        if (!productoDB) {
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

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

/***********************************************************
 * Creación de un nuevo producto
 ***********************************************************/

app.post('/producto', verifyToken, function(req, res) {
    let body = req.body;

    Categoria.findById(body.idCategoria, (err, categoriaDB) => {
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

        let producto = Producto({
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: body.disponible,
            categoria: body.idCategoria,
            usuario: req.usuario._id,
        });

        producto.save((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while creating a product',
                    err
                });
            }

            return res.json({
                ok: true,
                producto: productoDB
            });
        });
    });
});

/***********************************************************
 * Actualización de un producto
 ***********************************************************/

app.put('/producto/:id', verifyToken, function(req, res) {
    let id = req.params.id;
    let updProducto = _.omit(req.body, ['nombre', 'usuario', 'categoria']);

    Producto.findByIdAndUpdate(id, updProducto, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while updating a product',
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'Error while updating a product',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún producto con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

/***********************************************************
 * Eliminación de un producto
 ***********************************************************/

app.delete('/producto/:id', verifyToken, function(req, res) {
    let id = req.params.id;

    let notAvailable = { disponible: false };

    Producto.findByIdAndUpdate(id, notAvailable, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while deleting a product',
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'Error while deleting a product',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún producto con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.json({
            ok: true,
            message: `El producto '${ productoBorrado.nombre }' ya no está disponible`,
            productoBorrado: productoBorrado
        });
    });
});



module.exports = app;