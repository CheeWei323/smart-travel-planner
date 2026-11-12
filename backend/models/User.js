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
        // Server-controlled login state; excluded from ordinary reads and saves.
        failedLogins: {
            type: Number,
            default: 0,
            min: 0,
            select: false
        },
        lockUntil: {
            type: Date,
            default: null,
            select: false
        },
        // Changed atomically by the server; never included in ordinary saves.
        tokenVersion: {
            type: Number,
            default: 0,
            min: 0,
            select: false
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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);
