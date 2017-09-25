
'use strict';

var express = require('express');
var path = require('path');
var methodOverride = require('method-override');
var app = express();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sequelize = require('./models').sequelize;

var index = require('./routes/index');
// var users = require('./routes/users');

var books = require('./routes/books');
var loans = require('./routes/loans');
var patrons = require('./routes/patrons');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get('/', function (req, res) {
    res.render('home')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(methodOverride('_method'));

app.use('/', index);
app.use('/all_books', books);
app.use('/all_loans', loans);
app.use('/all_patrons', patrons);

// app.use('/users', users);



// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });


module.exports = app;
