import mongoose from 'mongoose';
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, // cloudnary url
        required: true,
    },
    coverImage: {
        type: String, // cloudnary url
    },
    watchHistory: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    password: {
        type: String,
        required: [true, "p is required"],
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

// here we use mongoose pre middleware before store data in db (where bcrypt is used to encrypt the password) 
// and we also use async await because of time taken by the process and also used normal function to access the value of this keyword
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//here we defined a custom method to check whether password is correct or not (where bcrypt is used to read encrypted password)
// and we also use async await because of time taken by the process and also used normal function to access the value of this keyword
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


//methods defined for generating bearer tokens
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
//methods defined for generating bearer tokens
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);