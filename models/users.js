const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    nom : String,
    prenom : String,
    email : String,
    password: String,
    profil : String,
    delete: 0,
    created_at: {type: Date, default: Date.now},
    updeted_at: {type: Date, default: Date.now}
})
module.exports = mongoose.model('user', userSchema, 'users')