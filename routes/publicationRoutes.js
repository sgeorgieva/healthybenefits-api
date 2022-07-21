const express = require('express');
const authController = require('./../controllers/authController');
const publicationController = require('./../controllers/publicationController');
const homeController = require('./../controllers/homeController');
const commentRouter = require('./commentRoutes');

const router = express.Router();

router.use('/:publicationId/comments', commentRouter);

router
  .route('/top-publications-slider')
  .get(homeController.aliasPublicationsSlider);

router
  .route('/top-publications-by-category')
  .get(homeController.aliasGetTopPublicationsByCriteria);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo(['admin', 'moderator']),
    publicationController.getPublications
  )
  .post(
    authController.protect,
    authController.restrictTo(['admin', 'moderator', 'user']),
    publicationController.createPublication
  );

router
  .route('/:id')
  .get(publicationController.getPublication)
  .patch(
    authController.protect,
    authController.restrictTo(['admin', 'moderator', 'user']),
    publicationController.updatePublication
  )
  .delete(
    authController.protect,
    authController.restrictTo(['admin', 'moderator', 'user']),
    publicationController.deletePublication
  );

module.exports = router;
