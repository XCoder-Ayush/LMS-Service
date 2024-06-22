const ServerConfig = require('./config/server.config');
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
const razorpay = require('./config/razorpay.config');
const Course = require('./models/course.model');
// Static Middlewares
app.use(
  express.json({
    limit: '16kb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '16kb',
  })
);

// app.use(
//   cors({
//     origin: ServerConfig.CORS_ORIGIN,
//     credentials: true,
//   })
// );

const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

app.use(express.static('public'));

app.use(cookieParser());

app.use(
  session({
    secret: ServerConfig.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());

//Passport Config
const initPassport = require('./config/passport.config');
const Query = require('./models/query.model');
initPassport(passport);

// Google OAuth2 Login Routes
// This is hit when sign in with google button is pressed
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// This route is called by the Google server (Not by us) Kind of a webhook
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login/failure',
  }),
  (req, res) => {
    const CLIENT_URL = ServerConfig.CLIENT_URL;
    const token = req.user.generateAccessToken();
    // const options = {
    //   httpOnly: true,
    // };
    res.cookie('accessToken', token);
    res.redirect(CLIENT_URL);
  }
);

// API Routes
// const apiRouter = require('./routes/routes');
// app.use('/api', apiRouter);

app.get('/api/v1/health', (req, res) => {
  res.json({ message: 'Service Is Healthy' });
});

app.get('/api/v1/login/success', (req, res) => {
  console.log(req.user);

  if (!req.user) {
    return res.redirect('/api/v1/login/failure');
  }

  return res.status(200).json(req.user);
});

app.get('/api/v1/login/failure', (req, res) => {
  return res.status(401).json({ message: 'Login Failed' });
});

app.post('/api/v1/order', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount,
      currency: currency,
      receipt: 'rcp1',
    };

    const order = await razorpay.orders.create(options);
    console.log(order);
    res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/v1/course', async (req, res) => {
  try {
    const course = new Course(req.body);
    const savedCourse = await course.save();
    console.log(savedCourse);
    res.status(200).json(savedCourse);
  } catch (error) {
    console.error('Error Creating Course Entry : ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/v1/courses', async (req, res) => {
  try {
    const courses = await Course.findAll();
    const filteredCourses = courses.map((course) => {
      const { createdAt, updatedAt, ...courseWithoutTimestamps } =
        course.toJSON();
      return courseWithoutTimestamps;
    });
    res.status(200).json(filteredCourses);
  } catch (error) {
    console.error('Error Fetching Course Entries : ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/v1/course/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    res.status(200).json(course);
  } catch (error) {
    console.error('Error Fetching Course Entry : ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/v1/contact', async (req, res) => {
  try {
    const query = new Query(req.body);
    const savedQuery = await query.save();
    console.log(savedQuery);
    res.status(200).json(savedQuery);
  } catch (error) {
    console.error('Error Creating Query Entry : ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = app;
