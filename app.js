const express = require('express');
const bodyParser = require('body-parser');
var passport = require('passport');
const app = express();
//var usersRouter = require('./routes/users.route');
// module.exports = app;




//const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/users', usersRouter);
app.use('/user', require('./routes/users.route'));
app.set('port', process.env.PORT || 8080);
app.get('/', function(req, res) {
    res.json({ message: 'Express is up!' });
});
// protected route

app.listen(app.get('port'), function(){
    console.log('Express is running');
    console.log(app.get('port'));
});
module.exports = app;
