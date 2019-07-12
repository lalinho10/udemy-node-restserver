const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let ProductoSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es obligatorio'] },
    precioUni: { type: Number, required: [true, 'El precio unitario es obligatorio'] },
    descripcion: { type: String, required: false },
    image: { type: String, required: false },
    disponible: { type: Boolean, required: true, default: true },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

ProductoSchema.plugin(uniqueValidator, { message: `El '{PATH}' debe ser único` });

module.exports = mongoose.model('Producto', ProductoSchema);