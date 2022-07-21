const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const contactSchema = new Schema({
  senderEmail: {
    type: String,
    lowercase: true,
    trim: true,
    index: {
      unique: true,
      partialFilterExpression: { senderEmail: { $type: 'string' } }
      // partialFilterExpression: { senderEmail: { $exists: true } }
    },
    required: [true, 'Please tell us your email'],
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  about: {
    type: String,
    trim: true,
    required: [true, 'Please tell us what your about message']
  },
  message: {
    type: String,
    trim: true,
    required: [true, 'Please tell us what your message']
  },
  dateAdded: Date
});

// Transform
contactSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
