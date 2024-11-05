const mongoose = require('mongoose');

// Define the schema for individual ratings (classRatings)
const classRatingSchema = new mongoose.Schema({
    raterID: { type: Number, required: true },  // ID of the student who gave the rating
    ratingValue: { type: Number, min: 1, max: 5, required: true },  // Rating value between 1 and 5
    comments: { type: String }  // Optional comment for the rating
});

// Define the schema for rating dimensions
const dimensionSchema = new mongoose.Schema({
    dimensionName: { type: String, required: true },  // Name of the dimension (e.g., "Knowledge", "Engagement")
    classRatings: [classRatingSchema]  // Array of individual ratings for this dimension
});

// Define the schema for ratings associated with specific classes
const ratingSchema = new mongoose.Schema({
    classID: { type: Number, required: true },  // ID of the class being rated
    dimensions: [dimensionSchema]  // Array of dimensions with class ratings
});

// Define the main Instructor schema
const instructorSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    ID: { type: Number, unique: true, required: true },
    Department: { type: String, required: true },
    Email: { type: String, unique: true, required: true },
    Ratings: [ratingSchema]  // Array of ratings for different classes
});

// Create the Instructor model
const InstructorModel = mongoose.model('Instructor', instructorSchema, 'instructors');

module.exports = InstructorModel;
