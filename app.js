const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const userRouter = require('./routes/userRoutes');
const publicationRouter = require('./routes/publicationRoutes');
const commentRouter = require('./routes/commentRoutes');
const aboutRouter = require('./routes/aboutRoutes');
const newsletterRouter = require('./routes/newsletterRoutes');
const contactRouter = require('./routes/contactRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// GLOBAL MIDDLEWARE

// Set CORS
app.use(
  cors({
    credentials: true,
    origin: true
  })
);

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross-side script attack)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'criteria',
      'criteriaFood',
      'dateAdded',
      'viewCount',
      'viewLikes'
    ]
  })
);

// Serving static files (files that are placed on our project - like html, imgs, etc.)
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// GLOBAL ROTUES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/publications', publicationRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/about', aboutRouter);
app.use('/api/v1/newsletter', newsletterRouter);
app.use('/api/v1/contact', contactRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
