const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    chat_id : String,
    name: String,
    age : String,
    phone: String
})

const User = mongoose.model('User', UserSchema)
module.exports = {User}