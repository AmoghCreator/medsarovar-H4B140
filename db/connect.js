const mongoose = require('mongoose')

function connect() {
    mongoose.connect(`mongodb+srv://amoghpreneur:${process.env.ATLAS_PASS}@cluster1.vx1tnwk.mongodb.net/`).then(() => console.log('connection succesful'));
}

module.exports = {connect}
