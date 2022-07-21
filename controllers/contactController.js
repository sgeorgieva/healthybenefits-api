const Contact = require('./../models/contactModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/emailContact');

exports.contact = catchAsync(async (req, res, next) => {
  const { senderEmail, about, message } = req.body;
  const contact = new Contact({
    senderEmail,
    about,
    message
  });
  await contact.save();

  try {
    sendEmail({
      email: senderEmail,
      subject: about,
      message
    });

    res.status(200).json({
      status: 'success',
      message:
        'Thanks for your messege!\n Soon some of our team will respond you.'
    });
  } catch (err) {
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
