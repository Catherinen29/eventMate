const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const dbConfig = require('./config/db');
const eventRouter = require('./routes/eventRoutes')
const userRouter = require('./routes/userRoutes')
const commentRouter = require('./routes/commentRoutes')
const User = require('./models/user')
const db = require('./config/db');

// Require Auth Related Packages
const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken')

// Require Passport Strategy and Options
const strategy = require('./lib/passportStrategy')
const jwtOptions = require('./lib/passportOptions')

console.log("Hello heroku")

const app = express();

// mongoose.connect(dbConfig);
// const db = mongoose.connection;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.once('open', () => console.log('Connected to MongoDB'));



const port = process.env.PORT || 5002;

// db.on('error', (error) => console.log(`ERROR: ${error.message}`));
// db.on('connected', () => console.log(`MondoDB Connected: ${dbConfig}`));
// db.on('disconnected', () => console.log('MongoDB Disconnected'))

app.use(express.json());

// Set CORS headers on response from this API using 'cors' npm package
app.use(cors())

// Middleware for auth
passport.use(strategy)

// Mount the imported Routes
app.use(eventRouter)
app.use(userRouter)
app.use(commentRouter)

app.post('/api/login', (req, res) => {
  if (req.body.username && req.body.password) {
    User.findOne({ username: req.body.username })
      .then((user) => {
        if(user.validatePassword(req.body.password)){
        
        const payload = {
          userId: user._id,
          username: user.username
        }
        const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: 1200 })

        res.json({ success: true, token: token })
      } else {
        res.status(401).json({success: false})
      }
      })
      .catch((error) => console.log(error, 'Invalid Username or Password'))
  }
})

app.listen(8080, () => console.log(`listening on port ${port}`));


