var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');

var app = express();

app.use(express.static('public/images'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'NODE-SECRET',
  name: 'nodecookie',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(__dirname + '/public'));
// app.set('views', __dirname + '/views');
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');

app.use('/', routes);

// app.use(function (req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

/* if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    return res.json('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function (err, req, res) {
  res.status(err.status || 500);
  return res.json('error', {
    message: err.message,
    error: {}
  });
}); */

module.exports = app;

app.listen(process.env.PORT || 3000, () => {
  console.log("Server up and listening");
})
