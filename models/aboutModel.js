const mongoose = require('mongoose');

const { Schema } = mongoose;

const aboutShema = new Schema({
  content: {
    type: String,
    required: [true, 'Please add a content']
  }
});

// Transform
aboutShema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const About = mongoose.model('About', aboutShema);

module.exports = About;
