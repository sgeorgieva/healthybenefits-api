const AppError = require('./../utils/appError');

const handleValidationErrorDB = err => {
  const errors = [];
  let message;

  Object.keys(err.errors).forEach(el => {
    if (err.errors[el].kind === 'enum' && err.errors[el].kind !== 'required') {
      if (err.errors[el].path.match(/^[a-z]*.\b/g)) {
        message = err.errors[el].message.replace(
          /enum.*\./g,
          err.errors[el].path
        );
      }

      if (err.errors[el].path.match(/[A-Z].*/g)) {
        const value = err.errors[el].path.match(/^[a-z]*/g).toString();
        const valueToReplace = err.errors[el].path
          .match(/[A-Z].*/g)
          .toString()
          .toLowerCase();

        message = err.errors[el].message.replace(
          /enum.*\./g,
          `${value} ${valueToReplace}`
        );
      }
    }

    errors.push({
      [el]: message && message.length ? message : err.errors[el].message
    });
  });

  return new AppError(errors, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const handleCastErrorDB = err => {
  const value = err.message
    .match(/"*[A-Z].[a-z]*"/g)[0]
    .match(/[A-Z]*[a-z]/g)
    .join('')
    .toLowerCase();

  const message = `No ${value} found with this ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};

const sendErrProd = (err, res) => {
  let errName;
  if (typeof err.message === 'string') {
    errName = 'errorMessage';
  } else {
    errName = 'errors';
  }

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      [errName]: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

// global error handler middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    sendErrProd(error, res);
  }
};
