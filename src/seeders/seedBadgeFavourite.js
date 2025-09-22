// Seeder for badge and favourite collections
// Usage: node src/seeders/seedBadgeFavourite.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const config = require('../config/config');
const Badge = require('../models/badge.model');
const Favourite = require('../models/favourite.model');

const badges = [
  { name: 'Explorer', description: 'Visited 10 places' },
  { name: 'Reviewer', description: 'Wrote 5 reviews' },
  { name: 'Guide Lover', description: 'Favourited 3 guides' },
  { name: 'Globetrotter', description: 'Booked trips in 5 different countries' },
  { name: 'Early Bird', description: 'Booked a tour 3 months in advance' },
  { name: 'Foodie Traveler', description: 'Joined 5 food tours' },
  { name: 'Mountain Climber', description: 'Completed 3 hiking trips' },
  { name: 'Culture Seeker', description: 'Visited 5 cultural heritage sites' },
  { name: 'Luxury Explorer', description: 'Booked a luxury package tour' },
  { name: 'Weekend Wanderer', description: 'Completed 3 weekend trips' },
  { name: 'Social Traveler', description: 'Traveled with 5 different friends' },
  { name: 'Photo Enthusiast', description: 'Uploaded 20 travel photos' },
  { name: 'Top Reviewer', description: 'Wrote 20 helpful reviews' },
  { name: 'Loyal Customer', description: 'Completed 10 bookings' },
  { name: 'Local Explorer', description: 'Visited 5 places in your home country' },
];

const favourites = [
  {
    name: 'Photography',
  },
  {
    name: 'Reading Books',
  },
  {
    name: 'Cooking',
  },
  {
    name: 'Hiking',
  },
  {
    name: 'Cycling',
  },
  {
    name: 'Listening to Music',
  },
  {
    name: 'Traveling',
  },
  {
    name: 'Swimming',
  },
  {
    name: 'Drawing & Painting',
  },
  {
    name: 'Yoga & Meditation',
  },
];

async function seed() {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);

  await Badge.deleteMany({});
  await Badge.insertMany(badges);

  await Favourite.deleteMany({});
  if (favourites.length > 0) {
    await Favourite.insertMany(favourites);
  }

  await mongoose.disconnect();
}

seed().catch(() => {
  process.exit(1);
});
