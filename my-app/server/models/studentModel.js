const mongoose = require('mongoose');

const groupRatingSchema = new mongoose.Schema({
    raterID: { type: Number, required: true },  // ID of the student who gave the rating
    ratingValue: { type: Number, min: 1, max: 5, required: true },  // Rating value between 1 and 5
    comments: { type: String }  // Optional comment for the rating
});

const dimensionSchema = new mongoose.Schema({
    dimensionName: { type: String, required: true },  // Name of the dimension (e.g., "Cooperation")
    groupRatings: [groupRatingSchema]  // Array of individual ratings for this dimension
});

const ratingSchema = new mongoose.Schema({
    classID: { type: Number, required: true },  // ID of the class
    dimensions: [dimensionSchema]  // Array of dimensions with group ratings
});

const studentSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    ID: { type: Number, unique: true, required: true },
    Email: { type: String, unique: true, required: true },
    Username: { type: String, required: true },
    Department: { type: String, required: true },
    Classes: [{ type: Number, ref: 'Class' }],// Referencing the custom class ID
    Groups: [{type: Number, ref: 'Groups' }], // Referencing the custom group ID
    Ratings: [ratingSchema],  // Array of Rating objects for different classes
    RiceGrains: { type: Number, default: 0 }  // Number of rice grains earned by the student
});

const StudentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = StudentModel;