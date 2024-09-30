const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    ID: { type: Number, unique: true, required: true },
    Email: { type: String, unique: true, required: true },
    Username: { type: String, required: true },
    Department: { type: String, required: true },
    Classes: [{ type: Number, ref: 'Class' }] // Referencing the custom class ID
});

const StudentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = StudentModel;