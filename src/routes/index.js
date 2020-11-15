const path = require('path');
const { Router } = require('express');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

let {PythonShell} = require('python-shell');
var myPythonScriptPath = path.join(__dirname,"../main.py");



var schedule = require('node-schedule');

const moment = require('moment');
moment().format(); 
const random = require('random');
var seconds = random.int(min = 0, max = 59);


const { validateUser, User } = require('../models/user');
const { validatePost, Post } = require('../models/posts');
const validateMiddleWare = require('../middleware/validate');
const verifyToken = require('../middleware/verifyToken');


const multer = require('multer');
const { time } = require('console');
const { string } = require('joi');
const { networkInterfaces } = require('os');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'../static/img'));
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg')
      }
    });
    
var upload = multer({ storage: storage });

dotenv.config();

router.get('/', async (req,res) =>{
    
    const token = req.cookies.token
    console.log({'token':token});
    try {
        if (!token) {
          return res.render('login',  {status: ''});
        }
        const decrypt = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          username: decrypt.username,
          password: decrypt.password,
        };
        res.redirect('/dashboard');
    } catch (err) {
        return res.render('login', {status: ''});
    }
    //const posts = await Post.find();  
});

router.post('/signup', [validateMiddleWare(validateUser)],  (req, res, next) => {

    User.findOne({username:req.body.username}).then(user => {
        if(user) {
            const error = new Error('Ese username esta en uso. Por favor escoge otro.');
            res.status(409);
            next(error);
        }else{
            bcrypt.hash(req.body.password, 12).then(async hashedPassword => {
                const user = new User({
                    username: req.body.username,
                    password: hashedPassword,
                    email: req.body.email
                });
                await user.save();
                res.json(user);
            });
        };
    });
});

router.post('/login', [validateMiddleWare(validateUser)], (req, res, next) =>{
    User.findOne({username:req.body.username}).then(user => {
        if (user) {
            bcrypt
            .compare(req.body.password, user.password)
            .then((result) => {

                if (result) {
                    
                    const payload = {
                        _id: user._id,
                        username: user.username
                    };
                    jwt.sign(payload, process.env.JWT_SECRET,{
                        expiresIn: '1d',
                        

                    }, (err, token) => {
                        if (err) {
                            respondError422(res, next);
                        }else{
                            console.log({'cookie enviado':token});
                            res.cookie('token',token,{httpOnly: true});
                            console.log('Signed Cookies: ', req.signedCookies);
                            res.redirect('/dashboard');
                        }
                    })
                }else{
                    res.render('login',  {status: 'loginFalse'});
                }
            });
        }else{
            res.render('login',  {status: 'loginFalse'});
        };
    });
});

router.get('/dashboard', verifyToken, async (req,res) => {
    var status = req.query.status;
    console.log({'este es el script':myPythonScriptPath});
    
    posts = await Post.find({}).sort({'date': 1});

    /*
    var nextJob = posts[0];
    if ({nextJob}) {

        var j = schedule.scheduleJob(nextJob.date,(nextJob =>{
            console.log(nextJob);
            //postear(nextJob);
        }).bind(null)
        );
        console.log({'proximo Post programado para las': nextJob.time});
    }
    */
    
   
    console.log({'status' : status});
    
    res.render('dashboard', {posts, status},);
    
});

router.post('/add', verifyToken, upload.single('img'), (req,res,next) => {
    
    var time = req.body.time;
    const gmt = time.slice(-2,);
    console.log({'time':time});

    if (!time){
        const error = new Error('No se ha podido agendar la publicación. Por favor intente de nuevo');
            res.status(409);
            next(error);
    };

    var timeSplitted = time.split(':');
    var hour = parseInt(timeSplitted[0]);

    if (gmt=="PM" && hour != 12) {
        hour = (hour + 12).toString()        
    }

    if (gmt=="AM" && hour == 12) {
        hour = '00'
        time = hour +':'+ timeSplitted[1]

    }

    var myDate = moment((hour + ':' + timeSplitted[1] + seconds.toString()), 'hh:mm:ss').toDate();

    if (myDate < Date.now()) {

        myDate = new Date(myDate.setDate(myDate.getDate() + 1));         
    }
    console.log({'myDate': myDate});
    const post = new Post({
        post: req.body.post,
        img: req.file.filename,
        time: time,
        date: myDate
    });

    if(!post) {
        const error = new Error("No se ha podido programar el post, por favor intente nuevamente.");
        res.status(400);
        return next(error); 
    }

    console.log(JSON.stringify(post));


    post.save().then(result => {
        
        var j = schedule.scheduleJob(post.date, async function (fireDate) {

            var newJob = await Post.findOne({date: fireDate}).exec();
            if (newJob) {
                postear(newJob);
            }
        });

        console.log({'proximo Post programado para las': post.time});

        res.redirect('/dashboard?status=added');
        res.status(201).json({
            message: "Se ha programado el Post exitosamente.",
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
    });
});

router.get('/edit/:id', verifyToken, async (req,res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    posts = await Post.find({}).sort({'date': 1});
    if (id) {
        res.render('edit', {
            post, posts
        });
    } else {
        res.redirect('/dashboard')
    }
});

router.post('/edit/:id', verifyToken, upload.single('img'), async (req, res) =>{
    const { id } = req.params;
    const time = req.body.time;
    const gmt = time.slice(-2,);

    console.log({'time':time});
    
    console.log({'problema nuevo' : req.file});

    if (!time){
        const error = new Error('No se ha podido agendar la publicación. Por favor intente de nuevo');
            res.status(409);
            next(error);
    };

    var timeSplitted = time.split(':');
    var hour = parseInt(timeSplitted[0]);

    if (gmt=="PM" && hour != 12) {
        hour = (hour + 12).toString()        
    }

    var myDate = moment((hour + ':' + timeSplitted[1] + seconds.toString()), 'hh:mm:ss').toDate();

    if (myDate < Date.now()) {

        myDate = new Date(myDate.setDate(myDate.getDate() + 1));         
    }

    
    if (req.file){
    var post = Post({
        _id: id,
        post: req.body.post,
        img: req.file.filename,
        time: req.body.time,
        date: myDate
    });
    }else{
    var post = Post({
        _id: id,
        post: req.body.post,
        
        time: req.body.time,
        date: myDate
    })};
    
    await Post.update({_id: id}, post);
    res.redirect('/dashboard');
});

router.post('/delete/:id', async (req,res) => {
    const { id } = req.params;
    await Post.remove({_id: id});

    res.redirect('/Dashboard?status=deleted');
}); 

router.get('/today', verifyToken, (req,res) => {
    res.render('today');
});

router.get('/history', verifyToken, (req,res) => {
    res.render('history');
});

router.get('/profile', verifyToken, (req,res) => {
    res.render('profile');
});

router.get('/logout', verifyToken, (req,res) => {
});

function respondError422(res,next){

    res.status(422);
    const error = new Error('Unable to login');
    next(error);

};


function postear(newJob){

    let mypromise = new Promise((resolve, reject) => {
        toSend = newJob._id
        console.log({ 'este es el id' : toSend })
        var options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [toSend]
        };

        PythonShell.run(myPythonScriptPath, options, function (err, results) {
        
            if (err) throw err;
            successMessage = results.toString()
        // results is an array consisting of messages collected during execution
            console.log('results: %j', successMessage);

        });
    });

    mypromise.then((successMessage) => {

        console.log(successMessage)
        console.log("siiii!!!");

    });
};

module.exports = router;