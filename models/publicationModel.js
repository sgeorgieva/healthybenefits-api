const mongoose = require('mongoose');

const { Schema } = mongoose;

const publicationSchema = new Schema(
  {
    id: false,
    title: {
      type: String,
      unique: true,
      required: [true, 'Please add a title'],
      minlength: [10, 'A title must contain more or equal than 10 characters']
    },
    content: {
      type: String,
      trim: true,
      required: [true, 'Please add a content'],
      minlength: [
        30,
        'A content must contain more or equal than 30 characters'
      ],
      index: {
        content: 'text'
      }
    },
    dateAdded: {
      type: Date,
      default: Date.now()
    },
    criteria: {
      type: String,
      required: [true, 'Please select a createria'],
      enum: ['news', 'food', 'fitness'],
      default: 'fitness'
    },
    criteriaFood: {
      type: String,
      enum: ['smoothies', 'salads', 'fresh', 'others'],
      required: [
        function() {
          return this.criteria === 'food';
        },
        'Please select a criteria food'
      ]
    },
    // criteriaNews: {
    //   type: String,
    //   enum: ['Yes', 'No'],
    //   required: [
    //     function() {
    //       return this.criteria === 'news';
    //     },
    //     'Please choose is a top news or not'
    //   ]
    // },
    image: {
      type: String,
      trim: true,
      // required: [true, 'Please add a image'],
      validate: {
        validator: function(val) {
          return val.match(/.*\.(gif|jpe?g|bmp|png)$/gim);
        },
        message: 'A publication image must have a valid image format'
      }
    },
    images: [String],
    viewCount: {
      type: Number,
      default: 0
    },
    viewLikes: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please add a author to this publication']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

publicationSchema.index({
  content: 'text',
  userId: 1,
  unique: true
});

// Virtual populate
publicationSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'publicationId',
  localField: '_id'
});

publicationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'comments',
    select: '-__v'
  }).populate({
    path: 'user',
    select: '-__v -passwordChangedAt -isSubscribed'
  });

  next();
});

// Transform _id into id for the response
publicationSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

// Update viewCont every time when a new request is send to getPublication
publicationSchema.methods.updateLikes = async function(Model, document) {
  await Model.findByIdAndUpdate(document._id, {
    viewCount: document.viewCount + 1
  });
};


const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
