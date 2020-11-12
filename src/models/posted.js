const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const postedSchema = mongoose.Schema({
    posted:{ 
        type: String,
        required:[true,'Caption del post'],
        maxlength: 2200
    },
    img:{
        type: String,
        required:[true, 'Imagen del post']
    },
    time:{
        type: Date,
        required:[true, 'Fecha en la que se publico el Post']
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userSchema',
    }],
});

const Posted = mongoose.model('posted', postSchema);

const validatePost = (posted) => {
    const schema = Joi.object({
        posted: Joi.string().max(2200).required(),
        img: Joi.string(),
        time: Joi.date().greater('now'),
        user: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userSchema',
            required: true
        }],
    })
    return schema.validate(posted);
};

module.exports = {
    Posted,
    validatePost,
};