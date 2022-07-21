const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentShema = new Schema(
  {
    id: false,
    content: {
      type: String,
      required: [true, 'Please add a comment']
    },
    dateAdded: {
      type: Date,
      default: Date.now()
    },
    publicationId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Publication',
      required: [true, 'Comment must belong to a publication.']
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

commentShema.index({
  content: 'text',
  publicationId: 1,
  userId: 1,
  unique: true
});

commentShema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Comment = mongoose.model('Comment', commentShema);

module.exports = Comment;
