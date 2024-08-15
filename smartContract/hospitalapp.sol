// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract HospitalBooking {
    struct Appointment {
        address patient;
        uint256 doctorId;
        uint256 timestamp;
        string diagnosis;
        bool isBooked;
    }

    struct Patient {
        address walletId;
        bool isRegistered;
    }

    mapping(address => Patient) public patients;
    mapping(uint256 => Appointment) public appointments;

    uint256 public appointmentCount;

    event AppointmentBooked(uint256 appointmentId, address patient, uint256 doctorId, uint256 timestamp, string diagnosis);

    modifier onlyRegisteredPatient() {
        require(patients[msg.sender].isRegistered, "Not a registered patient");
        _;
    }

    function registerPatient() public {
        require(!patients[msg.sender].isRegistered, "Patient already registered");
        patients[msg.sender] = Patient(msg.sender, true);
    }

    function bookAppointment(uint256 doctorId, uint256 timestamp, string memory diagnosis) public onlyRegisteredPatient {
        // In a real implementation, we would check the database for doctor's availability.
        // For simplicity, we assume the doctor is always available.

        appointmentCount++;
        appointments[appointmentCount] = Appointment(msg.sender, doctorId, timestamp, diagnosis, true);
        emit AppointmentBooked(appointmentCount, msg.sender, doctorId, timestamp, diagnosis);
    }

    function getAppointmentDetails(uint256 appointmentId) public view returns (address, uint256, uint256, string memory, bool) {
        Appointment memory appointment = appointments[appointmentId];
        return (appointment.patient, appointment.doctorId, appointment.timestamp, appointment.diagnosis, appointment.isBooked);
    }
}
