const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');
const { Types } = require('mongoose');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const users = await User.aggregate([
      {
        $match: { _id: new Types.ObjectId(payload.sub) },
      },
      {
        $lookup: {
          from: 'tourguides',
          localField: '_id',
          foreignField: 'userId',
          as: 'tourGuides',
        },
      },
    ]);
    if (!users[0]) {
      return done(null, false);
    }
    done(null, users[0]);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
