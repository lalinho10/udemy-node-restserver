const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const { verifyToken } = require('../middlewares/authentication');
const { verifyAdminRole } = require('../middlewares/faculties');

const Usuario = require('../models/usuario');

const app = express();



/***********************************************************
 * Consulta de usuarios
 ***********************************************************/
app.get('/usuarios', verifyToken, function(req, res) {
    let pagina = req.query.pagina || 0;
    pagina = Number(pagina);

    if (pagina <= 0) {
        return res.status(406).json({
            ok: false,
            message: 'Error while getting users',
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
            message: 'Error while getting users',
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

    Usuario.find({ status: true }).skip(offset).limit(regspp).exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting users',
                err
            });
        }

        Usuario.countDocuments({ status: true }, (err, numUsuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error while getting users',
                    err
                });
            }

            let limInf = offset + 1;
            let limSupTemp = (offset + regspp);
            let limSup = (limSupTemp > numUsuarios) ? numUsuarios : limSupTemp;

            let responseObject = {};

            if (usuarios.length > 0) {
                responseObject = {
                    ok: true,
                    usuarios: usuarios,
                    desde: limInf,
                    hasta: limSup,
                    total: numUsuarios
                };
            } else {
                responseObject = {
                    ok: true,
                    usuarios: usuarios
                }
            }

            res.json(responseObject);
        });
    });
});

/***********************************************************
 * Creación de un nuevo usuario
 ***********************************************************/
app.post('/usuario', [verifyToken, verifyAdminRole], function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while creating a user',
                err
            });
        }

        return res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

/***********************************************************
 * Actualización de un usuario
 ***********************************************************/
app.put('/usuario/:id', [verifyToken, verifyAdminRole], function(req, res) {
    let id = req.params.id;
    let body = _.omit(req.body, ['password', 'google']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while updating user',
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                message: 'Error while updating user',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún usuario con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

/***********************************************************
 * Eliminación de un usuario
 ***********************************************************/
app.delete('/usuario/:id', [verifyToken, verifyAdminRole], function(req, res) {
    let id = req.params.id;
    let softDelete = { status: false };

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, softDelete, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while deleting user',
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'Error while deleting user',
                err: {
                    errors: {
                        id: {
                            message: 'No se encontró algún usuario con el ID proporcionado'
                        }
                    }
                }
            });
        }

        res.json({
            ok: true,
            usuarioBorrado: usuarioBorrado
        });
    });
});



module.exports = app;