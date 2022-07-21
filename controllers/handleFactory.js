const mongoose = require('mongoose');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (!(await Model.find({ _id: req.params.id })).length) {
      return next(new AppError('No document found with that ID', 404));
    }

    const authorId = (await Model.findById(req.params.id)).user
      ? (await Model.findById(req.params.id)).user._id.toString()
      : (await Model.findById(req.params.id)).userId.toString();
    const userId = req.user._id.toString();

    if (authorId === userId && req.user.role === 'user') {
      await Model.findByIdAndDelete(req.params.id);
    } else if (req.user.role === 'admin' || req.user.role === 'moderator') {
      await Model.findByIdAndDelete(req.params.id);
    } else {
      return next(
        new AppError(
          'You do not have the permission to perform this action',
          403
        )
      );
    }

    // if (!document) {
    //   return next(new AppError('No document found with that ID', 404));
    // }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // const id = +req.params.id;
    // const tour = tours.filter(el => el.id === id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError('No document found with that ID', 404));
    }

    // if (!(await Model.find({ _id: req.params.id })).length) {
    //   return next(new AppError('No document found with that ID', 404));
    // }

    const authorId = (await Model.findById(req.params.id)).user
      ? (await Model.findById(req.params.id)).user._id.toString()
      : (await Model.findById(req.params.id)).userId.toString();
    const userId = req.user._id.toString();
    let document;

    if (
      authorId === userId &&
      req.user.role === 'user' &&
      !req.body.viewLikes
    ) {
      document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    } else if (authorId !== userId && req.body.viewLikes) {
      document = await Model.findByIdAndUpdate(
        req.params.id,
        {
          viewLikes: req.body.viewLikes + 1 
        },
        {
          new: true,
          runValidators: true
        }
      );
    } else {
      return next(
        new AppError(
          'You do not have the permission to perform this action',
          403
        )
      );
    }

    // if (!document) {
    //   return next(new AppError('No document found with that ID', 404));
    // }

    res.status(200).json({
      status: 'success',
      data: {
        data: document
      }
    });
  });

// to get rid from our try-catch blocks we simply wrapped
// our asynchronous function inside of the catchAsync() that we just created
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(
      Object.assign(
        req.body,
        req.params.publicationId
          ? { publicationId: req.params.publicationId, userId: req.user._id }
          : { user: req.user._id }
      )
    );

    res.status(201).json({
      status: 'success',
      data: {
        data: newDocument
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError('No document found with that ID', 404));
    }

    let query = Model.findById(req.params.id);
    // Model.findOne({ _id: req.params.id })
    if (popOptions) query = query.populate(popOptions);
    const document = await query;
    document.updateLikes(Model, document);

    // if (!document) {
    //   return next(new AppError('No document found with that ID', 404));
    // }

    res.status(200).json({
      status: 'success',
      data: {
        data: document
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.publicationId)
      filter = { publicationId: req.params.publicationId };

    if (req.params.userId) filter = { userId: req.params.userId };

    // EXECUTE THE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const documents = await features.query.explain();
    const documents = await features.query.select('-publicationId');

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        data: documents
      }
    });
  });
