const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Subject: { type: String, required: true },
    Section: { type:String, required: true},
    ID: { type: Number, unique: true, required: true},
    Instructor: { type: Number, ref: 'Instructor' }, // Referencing the custom instructor ID
    Students: [{ type: Number, ref: 'Student' }], // Referencing the custom student IDs
    Groups: [{type: Number, ref: 'Group'}], // Referencing the custom group IDs
    submissionDeadline: { type: Date, required: true } // Adding the deadline field

});

const ClassModel = mongoose.model('Class', classSchema, 'classes');
module.exports = ClassModel;