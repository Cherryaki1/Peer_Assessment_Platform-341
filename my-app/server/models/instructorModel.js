const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    instructorID: { type: Number, unique: true, required: true },
    Email: { type: String, unique: true, required: true },
    Username: { type: String, required: true },
    Department: { type: String, required: true },
    Classes: [{ type: Number, ref: 'Class' }] // Referencing the custom class ID
});

const InstructorModel = mongoose.model('Instructor', instructorSchema,'instructors');
module.exports = InstructorModel;
