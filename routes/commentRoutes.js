const express = require('express');
const commentController = require('./../controllers/commentController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo(['admin', 'moderator']),
    commentController.getComments
  )
  .post(
    authController.restrictTo(['admin', 'moderator', 'user']),
    commentController.createComment
  );

router
  .route('/:id')
  .get(
    authController.restrictTo(['admin', 'moderator', 'user']),
    commentController.getComment
  )
  .patch(
    authController.restrictTo(['admin', 'moderator', 'user']),
    commentController.updateComment
  )
  .delete(
    authController.restrictTo(['admin', 'moderator', 'user']),
    commentController.deleteComment
  );

module.exports = router;
