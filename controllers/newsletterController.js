const Newsletter = require('./../models/newsletterModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

exports.subscribeNewsletter = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  const abonate = await Newsletter.find({ email });
  const user = await User.find({ email });

  if (!!abonate.length || (user[0] && !!user[0].isSubscribed === true)) {
    return next(
      new AppError(
        'Sorry, you have been already subscribed to our newsletter!',
        400
      )
    );
  }

  if (!!user.length) {
    await User.bulkWrite([
      {
        updateOne: {
          filter: { email: user[0].email },
          update: { isSubscribed: true }
        }
      }
    ]);
  } else {
    await Newsletter.create({
      name,
      email
    });
  }

  const subject = `Newsletter subscription`;
  const message = `Thank you for subscribing to our newsletter, ${name}!\n
  If you no longer wish to receive any of our valuable emails, that's absolutely okay. 
  Please just click this link, and you'll be unsubscribed.`;

  try {
    sendEmail({
      email: email,
      subject,
      message
    });

    res.status(200).json({
      status: 'success',
      message:
        'Thank you for your suscription!\n Later you will recieve a email in your mailbox!'
    });
  } catch (err) {
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
