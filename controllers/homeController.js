const Publication = require('./../models/publicationModel');
const catchAsync = require('./../utils/catchAsync');

exports.aliasPublicationsSlider = catchAsync(async (req, res, next) => {
  const results = [];
  const news = await Publication.aggregate([
    {
      $match: { criteria: 'news' }
    },
    {
      $sort: {
        viewCount: -1
      }
    },
    {
      $limit: 3
    },
    {
      $project: { _id: 0, id: '$_id', title: true, image: true }
    }
  ]);

  const fitness = await Publication.aggregate([
    {
      $match: { criteria: 'fitness' }
    },
    {
      $sort: {
        viewCount: -1
      }
    },
    {
      $limit: 3
    },
    {
      $project: { _id: 0, id: '$_id', title: true, image: true }
    }
  ]);

  let food = await Publication.aggregate([
    {
      $match: {
        criteriaFood: { $in: ['smoothies', 'salads', 'fresh'] }
      }
    },
    {
      $group: {
        _id: '$criteriaFood',
        items: { $push: { id: '$_id', title: '$title', image: '$image' } }
      }
    },
    {
      $sort: {
        viewCount: -1
      }
    },
    {
      $project: { items: { $slice: ['$items', 1] } }
    }
  ]);

  food = food.map(el => {
    const extractedEl = el.items.shift(0, el.items.length);
    return extractedEl;
  });

  results.push(...fitness, ...news, ...food);

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      results
    }
  });
});

exports.aliasGetTopPublicationsByCriteria = catchAsync(
  async (req, res, next) => {
    let publications = await Publication.aggregate([
      {
        $match: {
          criteria: { $in: ['news', 'fitness', 'food'] }
        }
      },
      {
        $sort: { viewLikes: -1 }
      },
      {
        $group: {
          _id: '$criteria',
          items: {
            $push: {
              id: '$_id',
              title: '$title',
              image: '$image',
              likes: '$viewLikes',
              criteria: '$criteria',
              criteriaFood: '$criteriaFood'
            }
          }
        }
      },
      {
        $project: { items: { $slice: ['$items', 4] } }
      }
    ]);

    const arr = [];
    let a = publications[0].items;
    let b = publications[1].items;
    let c = publications[2].items;

    a = a.splice(0, a.length);
    b = b.splice(0, b.length);
    c = c.splice(0, c.length);

    arr.push(...c, ...a, ...b);
    publications = arr;

    res.status(200).json({
      status: 'success',
      results: arr.length,
      data: {
        publications
      }
    });
  }
);
