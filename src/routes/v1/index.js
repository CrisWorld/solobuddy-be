const express = require('express');

const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const tourGuideRoute = require('./tour-guide.route');

const aiRoute = require('./ai.route');
const docsRoute = require('./docs.route');
const seedRoute = require('./seed.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/tour-guides',
    route: tourGuideRoute,
  },
  {
    path: '/ai',
    route: aiRoute,
  },
  {
    path: '/seed',
    route: seedRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
