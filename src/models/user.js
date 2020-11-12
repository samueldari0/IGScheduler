const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: [true, 'Por favor ingresa un username'],
        unique: true,
        lowercase: true,
    },
    email:{
        type: String,
        required: [true, 'Please enter a email'],
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: [true, 'Por favor ingresa tu clave'],
        minlength: 6,
    },
    isVerified: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date

    
});

const User = mongoose.model('user', userSchema);

const validateUser = (user) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: Joi.string().trim().min(6),
    })
    return schema.validate(user);
};

module.exports = {
    User,
    validateUser,
};


