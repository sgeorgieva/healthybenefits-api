const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    id: false,
    username: {
      type: String,
      unique: true,
      required: [true, 'Please tell us your username'],
      trim: true,
      minlength: [4, 'A username must have more or equal than 4 charachters'],
      maxlength: [15, 'A username must have less or equal than 15 charachters']
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'Please tell us your email'],
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    fullName: {
      type: String,
      trim: true,
      required: [true, 'Please tell us your full name'],
      minlength: [4, 'A full name must have more or equal than 4 characters'],
      maxlength: [40, 'A full name must have less or equal than 40 characters']
    },
    photo: {
      type: String,
      trim: true,
      validate: {
        validator: function(val) {
          return val.match(/.*\.(gif|jpe?g|bmp|png)$/gim);
        },
        message: 'A user photo must have a valid image format'
      }
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'user', 'guest'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      validate: {
        validator: function(val) {
          return val.match(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g
          );
        },
        message:
          'A user password must have minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'
      },
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // this only works on CREATE and SAVE!!!
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords are not the same'
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    isSubscribed: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
userSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'userId',
  localField: '_id'
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Encrypt/Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the passwordConfirm field before was saved/persist to DB
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  // this.populate({
  //   path: 'comments',
  //   select: '-__v'
  // });
  next();
});

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  // create random string with the build in crypto module and converted into hex string
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Transform
userSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
