const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const stripe = require('./config/stripe');
const { Booking } = require('./models');
const { emailService } = require('./services');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// 🚨 Stripe webhook phải đặt trước express.json()
app.post('/v1/bookings/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    return res.sendStatus(400);
  }
  const session = event.data.object;
  const { bookingId } = session.metadata || {};
  if (event.type === 'checkout.session.completed') {
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { status: 'pending' });
    }
    const booking = await Booking.findById(bookingId);
    if (booking) {
      const subject = 'Bạn có booking mới trên SoloBuddy';
      const text = `Xin chào ${booking.guideSnapshot.name}, bạn có booking mới từ ${booking.travelerSnapshot.name}.`;

      const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #2c3e50;">Bạn có booking mới trên <strong>SoloBuddy</strong>!</h2>
      <p>Xin chào <b>${booking.guideSnapshot.name}</b>,</p>
      <p>
        Bạn vừa nhận được một booking mới từ 
        <b>${booking.travelerSnapshot.name}</b> (<a href="mailto:${booking.travelerSnapshot.email}">${
        booking.travelerSnapshot.email
      }</a>)
        cho tour "<b>${booking.tourSnapshot.title}</b>".
      </p>
      <p>
        📅 Từ ngày: <b>${booking.fromDate.toLocaleDateString()}</b><br>
        📅 Đến ngày: <b>${booking.toDate.toLocaleDateString()}</b><br>
        💰 Tổng tiền: <b>${booking.totalPrice.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}</b>
      </p>
      <p>Vui lòng đăng nhập vào hệ thống <a href="https://solobuddy-fe.vercel.app/">SoloBuddy</a> để xem chi tiết.</p>
      <hr>
      <p style="font-size: 12px; color: #888;">Đây là email tự động, vui lòng không trả lời.</p>
    </div>
  `;

      await emailService.sendEmail(booking.guideSnapshot.email, subject, text, html);
    }
  }

  // Session hết hạn
  if (event.type === 'checkout.session.expired') {
    if (bookingId) {
      await Booking.findByIdAndDelete(bookingId);
    }
  }

  // Thanh toán thất bại
  if (event.type === 'checkout.session.async_payment_failed' || event.type === 'payment_intent.payment_failed') {
    if (bookingId) {
      await Booking.findByIdAndDelete(bookingId);
    }
  }

  res.sendStatus(200);
});

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
