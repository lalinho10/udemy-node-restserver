const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const VALID_ROLES = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

let Schema = mongoose.Schema;

let UsuarioSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es obligatorio'] },
    email: { type: String, unique: true, required: [true, 'El email es obligatorio'] },
    password: { type: String, required: [true, 'La constraseña es obligatoria'] },
    image: { type: String, required: false },
    role: { type: String, default: 'USER_ROLE', enum: VALID_ROLES },
    status: { type: Boolean, default: true },
    google: { type: Boolean, default: false }
});

UsuarioSchema.methods.toJSON = function() {
    let usuario = this;
    let objUsuario = usuario.toObject();
    delete objUsuario.password;
    return objUsuario;
};

UsuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} debe ser único' });

module.exports = mongoose.model('Usuario', UsuarioSchema);