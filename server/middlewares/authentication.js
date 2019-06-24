const jwt = require('jsonwebtoken');

let verifyToken = (req, res, next) => {
    const token = req.get('token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Invalid token',
            err: {
                errors: {
                    token: {
                        message: 'Token inválido'
                    }
                }
            }
        });
    } else {
        jwt.verify(token, process.env.JWT_SEED, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    ok: false,
                    message: 'Invalid token',
                    errors: err
                });
            }

            req.usuario = decoded.usuario;

            next();
        });
    }
}

module.exports = {
    verifyToken: verifyToken
}