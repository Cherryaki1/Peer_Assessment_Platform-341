const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    GroupName: { type: String, required: true },
    classID: { type: Number, ref: 'Class', required: true },  // Reference to the class
    Students: [{ type: Number, ref: 'Student' }],              // Array of student IDs in the group
    Instructor: { type: Number, ref: 'Instructor', required: true }, // Reference to the instructor by ID
});

const GroupModel = mongoose.model('Group', groupSchema, 'groups');
module.exports = GroupModel;