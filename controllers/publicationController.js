const Publication = require('./../models/publicationModel');
const factory = require('./handleFactory');

exports.getPublication = factory.getOne(Publication);
exports.getPublications = factory.getAll(Publication);
exports.createPublication = factory.createOne(Publication);
exports.updatePublication = factory.updateOne(Publication);
exports.deletePublication = factory.deleteOne(Publication);
