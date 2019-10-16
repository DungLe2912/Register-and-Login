var express=require('express');

//var passport=require('../middlewares/passport')
var router=express.Router();

var passport = require('passport');
var passportJWT = require('passport-jwt');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {};
var jwt = require('jsonwebtoken');

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'wowwow';
const app = express();
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    database: 'users_db',
    username: 'root',
    password: 'password',
    dialect: 'mysql',
  });

sequelize
  .authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

// create user model
const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
});

// create table with user model
User.sync()
  .then(() => console.log('User table created successfully'))
  .catch(err => console.log('oooh, did you enter wrong database credentials?'));

// function thêm mới 1 user
const createUser = async({name, password}) => {
    return await User.create({ name, password });
};
// function lấy ra danh sách users
const Users = async() => {
    return await User.findAll();
};
// function lấy ra 1 users
const getUser = async obj => {
    return await User.findOne({
        where: obj,
    });
};

// lets create our strategy for web token
var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  var user = getUser({ id: jwt_payload.id });
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
// use the strategy
passport.use(strategy);
app.use(passport.initialize());
router.get('/', function(req, res){
    Users().then(user => res.json(user))
});

router.post('/register', function(req, res, next){
    const {name, password} = req.body;
    createUser({ name, password }).then(user =>
        res.json({ user, msg: 'account created successfully' })
    );
})

router.post('/login', async function(req, res, next) { 
  const { name, password } = req.body;
  if (name && password) {
    let user = await getUser({ name: name });
    if (!user) {
      res.status(401).json({ message: 'No such user found' });
    }
    if (user.password === password) {
      // from now on we'll identify the user by the id and the id is the 
      // only personalized value that goes into our token
      let payload = { id: user.id };
      let token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({ msg: 'ok', token: token });
    } else {
      res.status(401).json({ msg: 'Password is incorrect' });
    }
  }
});
router.get('/protected', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.json('Success! You can now see this without a token.');
});
module.exports = router;
