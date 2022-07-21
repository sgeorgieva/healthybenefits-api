const About = require('./../models/aboutModel');
const factory = require('./handleFactory');

exports.getAbouts = factory.getAll(About);
exports.getAboutInfo = factory.getOne(About);
exports.createAboutInfo = factory.createOne(About);
exports.updateAboutInfo = factory.updateOne(About);
exports.deleteAboutInfo = factory.deleteOne(About);
