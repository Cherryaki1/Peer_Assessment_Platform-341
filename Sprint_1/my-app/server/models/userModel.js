const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Email: { type: String, unique: true, required: true },
  Password: { type: String, required: true },
  Username: { type: String, required: true },
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  ID: { type: Number, required: true },
  Department: { type: String, required: true }
});

const UserModel = mongoose.model('User', userSchema, 'userLogin');

module.exports = UserModel;
