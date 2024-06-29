const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
    name:String,
    dateandtime: String,
})

const Appointment = mongoose.model('Appointment', AppointmentSchema)

module.exports = {Appointment}