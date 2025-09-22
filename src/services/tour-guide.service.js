// Service: Get list of tour guides with filter and pagination
const TourGuide = require('../models/tour-guide.model');

const queryTourGuides = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;

  const pipeline = [];

  // base filter (ngoại trừ user.name)
  const baseFilter = { ...filter };
  delete baseFilter['user.name'];

  if (Object.keys(baseFilter).length > 0) {
    pipeline.push({ $match: baseFilter });
  }

  // nếu có filter theo user.name thì join user
  if (filter['user.name']) {
    const regex = filter['user.name'].$regex || filter['user.name'];
    pipeline.push(
      {
        $lookup: {
          from: 'users', // collection user
          localField: 'userId', // field trong tourGuide
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' }, // inner join
      {
        $match: {
          'user.name': { $regex: regex, $options: 'i' },
        },
      }
    );
  }

  // sort
  let sort = { createdAt: -1 };
  if (options.sortBy) {
    sort = {};
    options.sortBy.split(',').forEach((sortOption) => {
      const [key, order] = sortOption.split(':');
      sort[key] = order === 'desc' ? -1 : 1;
    });
  }

  pipeline.push({ $sort: sort });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const results = await TourGuide.aggregate(pipeline);

  // total count
  const countPipeline = [...pipeline];
  countPipeline.pop(); // bỏ $limit
  countPipeline.pop(); // bỏ $skip
  countPipeline.pop(); // bỏ $sort
  const totalResults = (await TourGuide.aggregate(countPipeline)).length;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Create a new tour guide
 * @param {Object} tourGuideBody
 * @returns {Promise<TourGuide>}
 */
const createTourGuide = async (tourGuideBody) => {
  return TourGuide.create(tourGuideBody);
};

module.exports = {
  queryTourGuides,
  createTourGuide,
};
