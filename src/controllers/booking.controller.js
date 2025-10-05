const stripe = require('../config/stripe');
const catchAsync = require('../utils/catchAsync');
const bookingService = require('../services/booking.service');
const config = require('../config/config');
const { Booking } = require('../models');

const createBooking = catchAsync(async (req, res) => {
  const travelerId = req.user._id;
  const booking = await bookingService.createBooking(req.body, travelerId, req);
  // Tạo Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: `Booking: ${booking.tourSnapshot.title} with ${booking.guideSnapshot.name}`,
          },
          unit_amount: Math.round(booking.totalPrice),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking._id.toString(),
      travelerId: travelerId.toString(),
    },
    success_url: `${config.frontend.url}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend.url}/payment-cancel`,
  });

  res.status(201).send({
    booking,
    checkoutUrl: session.url,
  });
});

const getBookings = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role === 'user') {
    filter.travelerId = req.user._id;
  } else if (req.user.role === 'guide') {
    filter.tourGuideId = req.user.tourGuides[0]._id;
  }
  const bookings = await Booking.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'users',
        localField: 'travelerId',
        foreignField: '_id',
        as: 'traveler',
      },
    },
    { $unwind: '$traveler' },
    {
      $lookup: {
        from: 'tourguides',
        localField: 'tourGuideId',
        foreignField: '_id',
        as: 'tourGuide',
      },
    },
    { $unwind: '$tourGuide' },
    {
      $lookup: {
        from: 'users',
        localField: 'tourGuide.userId', // userId của tourGuide
        foreignField: '_id',
        as: 'tourGuideUser',
      },
    },
    { $unwind: '$tourGuideUser' },
  ]).sort({ createdAt: -1 });
  res.send(bookings);
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const tourGuideId = req.user.tourGuides[0]._id;
  const { bookingId } = req.params;
  const { status } = req.body;
  const booking = await bookingService.updateBookingStatus(bookingId, tourGuideId, status);
  res.send(booking);
});

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
};
