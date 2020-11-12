//implementar un algortimo para limpiar imagenes de post ya publicados que haya un rango (20 dias)

const path = require('path');
const express = require('express');
const volleyball = require('volleyball');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { spawn } = require('child_process');
var fs = require('fs');

const {Post} = require('./models/posts')

var schedule = require('node-schedule');

const childPython = spawn('python', )

require('dotenv').config();

var port = process.env.PORT || 4008;

const app = express();

//conecting db
mongoose.connect('mongodb://localhost/igscheduler')
.then(db => console.log('db connected'))
.catch(err => console.log(err));

//importing routes
const indexRoutes = require('./routes/index');

//settings
app.set('port',process.env.PORT || 5000);
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

//middlewares
app.use(volleyball);
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

//routes
app.use('/', indexRoutes);

//static
app.use(express.static(__dirname + '/static'));
//app.use(express.static(__dirname + '/static/img/Posts'))

//errorHandler
function notFound(req, res, next) {
    res.status(404);
    const error = new Error('Not Found - ' + req.originalUrl);
    next(error);
}
  
function errorHandler(err, req, res, next) {
    res.status(res.statusCode || 500);
    res.json({
      message: err.message,
      stack: err.stack
    });
}

app.use(notFound);
app.use(errorHandler);

async function nearJob(Post) {
  const result = await Post.find({}).sort({'date': 1});
  const nearJob = result[0];
  console.log({ "Esta es la vaina" : nearJob});
  return nearJob
};

const nextJob = nearJob(Post);

//starting the server
app.listen(port, () => {
    console.log('API REST Listening on port: '+port);
});