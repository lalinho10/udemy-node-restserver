let verifyAdminRole = (req, res, next) => {
    const usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            message: 'Invalid role',
            err: {
                errors: {
                    role: {
                        message: 'El usuario no cuenta con las facultades necesarias para realizar esta acción'
                    }
                }
            }
        });
    } else {
        next();
    }
}

module.exports = {
    verifyAdminRole: verifyAdminRole
}