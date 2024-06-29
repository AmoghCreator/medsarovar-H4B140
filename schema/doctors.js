const {Schema, mongo, default: mongoose} = require('mongoose');

const DoctorSchema = new Schema({
    doctorName : String,
    description : String,
    phoneNumber : String,
    speciality : String
})

const Doctor = mongoose.model('Doctor', DoctorSchema)

module.exports = {Doctor}