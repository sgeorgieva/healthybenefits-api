const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const newsletterSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Please tell us your email'],
    validate: [validator.isEmail, 'Please provide a valid email']
  }
});

// Transform
newsletterSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;
