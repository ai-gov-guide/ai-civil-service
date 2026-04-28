require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var pool = require('./config/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var documentsRouter = require('./routes/documentsRouter');
var questionRouter = require('./routes/questionRouter');
var authRouter = require('./routes/authRouter');


var app = express();

const checkDBConnection = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("DB 정상 연결");
  } catch (err) {
    console.error("DB 연결 오류 :", err);
  } finally {
    if (conn) conn.release();
  }
};
checkDBConnection();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/questions', questionRouter);
app.use('/api/v1/auth', authRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
// set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


// render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;