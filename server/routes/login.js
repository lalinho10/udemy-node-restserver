const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();



app.post('/login', function(req, res) {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting users',
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
                            message: '(Usuario) y/o contraseña incorrectos'
                        }
                    }
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Error while updating user',
                err: {
                    errors: {
                        id: {
                            message: 'Usuario y/o (contraseña) incorrectos'
                        }
                    }
                }
            });
        }

        const token = jwt.sign({ usuario: usuarioDB }, process.env.JWT_SEED, { expiresIn: process.env.JWT_EXP });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });
    });
});



module.exports = app;