const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');

const app = express();



/***********************************************************
 * Autenticación de la aplicación
 ***********************************************************/
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
                message: 'Error while getting user',
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
                message: 'Error while getting user',
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

/***********************************************************
 * Autenticación de google
 ***********************************************************/

async function verify(obj) {
    const ticket = await client.verifyIdToken({
        idToken: obj.idToken,
        audience: process.env.CLIENT_ID
    });

    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        image: payload.picture
    };
}

app.post('/google', async function(req, res) {
    let idtoken = req.body.idtoken;

    let googleUser = await verify({ idToken: idtoken })
        .catch((err) => {
            return res.status(403).json({
                ok: false,
                message: 'Error while autheticating google user',
                err
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error while getting users',
                err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error while getting user',
                    err: {
                        errors: {
                            id: {
                                message: 'El usuario ya existe. Favor de autenticarse normalmente'
                            }
                        }
                    }
                });
            } else {
                const token = jwt.sign({ usuario: usuarioDB }, process.env.JWT_SEED, { expiresIn: process.env.JWT_EXP });

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token
                });
            }
        } else {
            let usuario = new Usuario();

            usuario.name = googleUser.name;
            usuario.email = googleUser.email;
            usuario.image = googleUser.image;
            usuario.google = true;
            usuario.password = ':)';

            const token = jwt.sign({ usuario: usuarioDB }, process.env.JWT_SEED, { expiresIn: process.env.JWT_EXP });

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
                    usuario: usuarioDB,
                    token: token
                });
            });
        }

    });
});



module.exports = app;