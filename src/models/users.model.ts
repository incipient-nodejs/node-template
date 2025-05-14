import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { TUserModel } from "../services/user/user.interface";

// Create the user schema
const usersSchema = new Schema<TUserModel>(
  {
    role: {
      type: String,
      required: true,
      enum: [
        "admin",
        "user"
      ],
    },
    fullName: { type: String },
    otp: { type: String, default: null },
    otpExpiryTime: { type: Date, default: null },
    profilePicture: { type: String, default: null },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true
    },
    stripeCustomerId: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: "ACTIVE",
      enum: [
        "ACTIVE",
        "INACTIVE",
      ]
    },
    freeAccess: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    deletedAt: {
      type: Date,
      default: null
    },
    defaultZipCode: {
      type: String,
      required: false
    }
  },
  { strict: true, timestamps: true }
);

usersSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.forgotPassword;
    delete ret.otp;
    delete ret.otpExpiryTime;
  },
});

const Users = mongoose.model<TUserModel>("users", usersSchema);

export default Users;
