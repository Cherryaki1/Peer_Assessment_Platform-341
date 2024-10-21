const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    GroupName: { type: String, required: true },
    groupID: { type: Number, unique: true, required: true},
    Instructor: { type: Number, ref: 'Instructor' }, // Referencing the custom instructor ID
    Students: [{ type: Number, ref: 'Student' }], // Referencing the custom student IDs
    Class: { type: Number, ref: 'Class', required: true },  // Reference to the class
});

const GroupModel = mongoose.model('Group', groupSchema, 'groups');
module.exports = GroupModel;