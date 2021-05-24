const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
    nom : String,
    email : String,
    password: String,
    profil : String,
    created_at: {type: Date, default: Date.now},
    updeted_at: {type: Date, default: Date.now}
})
module.exports = mongoose.model('admin ', adminSchema, 'admins')