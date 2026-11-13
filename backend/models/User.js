const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        // "user" = normal account, "admin" = can access /api/admin
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        // Admin can suspend an account by setting this to false
        isActive: {
            type: Boolean,
            default: true
        },
        consentAt: {
            type: Date,
            default: null
        }
    },
    
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);
