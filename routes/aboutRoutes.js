const express = require('express');
const authController = require('./../controllers/authController');
const aboutController = require('./../controllers/aboutController');

const router = express.Router();

router
  .route('/')
  .get(aboutController.getAbouts)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    aboutController.createAboutInfo
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    aboutController.getAboutInfo
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    aboutController.updateAboutInfo
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    aboutController.deleteAboutInfo
  );

module.exports = router;
