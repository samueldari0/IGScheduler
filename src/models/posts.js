const Joi = require('joi');
const mongoose = require('mongoose');
const user = require('./user');
const Schema = mongoose.Schema;

//agregar campo boolean
const postSchema = mongoose.Schema({
    post:{ 
        type: String,
        required:[true,'Por favor ingresa el caption que llevara la publicación'],
        maxlength: 2200
    },
    img:{
        type: String,
        required:[true, 'Por favor selecciona la imagen que se publicara']
    },
    time:{
        type: String,
        required:[true, 'Por favor escoje la hora a la que quieres que se publique el Post']
    },
    date:{
        type: Date,
    }
    
});

const Post = mongoose.model('post', postSchema);

//no esta conectado el validatePost
const validatePost = (post) => {
    
    const schema = Joi.object().keys({
        post: Joi.string().max(2200).required(),
        img: Joi.string().required(),
        time: Joi.string().min(7).max(8).required(),
        date: Joi.date()
    })
    return schema.validate(post);
};

module.exports = {
    Post,
    validatePost,
};