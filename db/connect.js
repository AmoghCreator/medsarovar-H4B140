const mongoose = require('mongoose')

function connect() {
    mongoose.connect('mongodb://127.0.0.1:27017/hack4bengal').then(() => console.log('connection succesful'));
}

module.exports = {connect}