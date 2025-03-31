import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
      required: false,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId, // because watch history is a array of video ids
        ref: "Video", // reference to the video model
      },
    ],
    password: {
      type: String,
      required: [true, " Password is required"], // in the array the second element is the error message sent to the front end
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

/*

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if the password is not modified then return next     //here this line is added as without this anything modified will again and again change the password value

  this.password = bcrypt.hash(this.password, 10); // this is the password that is being hashed

  next(); // this next should be used as it passes to next middleware
});*/

UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10); // this is the password that is being hashed
  }

  // return next(); // if the password is not modified then return next     //here this line is added as without this anything modified will again and again change the password value

  next(); // this next should be used as it passes to next middleware
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // this is the function that compares the password
};

UserSchema.methods.generateAccessToken = function () {
  //short time access token
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRY }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  //short time access token
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRY }
  );
};

export const User = mongoose.model("User", UserSchema);
