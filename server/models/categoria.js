const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let CategoriaSchema = new Schema({
    descripcion: { type: String, unique: true, required: [true, 'La descripción es obligatoria'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

CategoriaSchema.plugin(uniqueValidator, { message: `La {PATH} debe ser única` });

module.exports = mongoose.model('Categoria', CategoriaSchema);