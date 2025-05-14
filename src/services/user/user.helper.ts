import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { SendMail } from "../../helper/mail.helper";
import Users from "../../models/users.model";

// Hash the password :
export const generateBcryptPassword = async (password: string): Promise<string> => {
  try {
    if (!password) {
      throw new Error("Password is required");
    }
    const salt = await bcrypt.genSalt(10);
    const bcryptedPassowrd = await bcrypt.hash(password, 10);
    return bcryptedPassowrd;
  } catch (error) {
    throw error;
  }
};

// Create Json-Web Token : 
export const createToken = (id: string, role: string) => {
  const maxAge = 30 * 24 * 60 * 60; //valid for 30days
  const secretKey = process.env.JWT_SECRET_KEY as string;
  return `Bearer ${jwt.sign({ id, role }, secretKey, { expiresIn: maxAge })}`;
};

// Generate code for user verification :
export const generateTokenForEmailVerification = (code: number, userId: string) => {
  try {
    const maxAge = 48 * 60 * 60; //valid for 48 hours
    const secretKey = process.env.JWT_SECRET_KEY as string;
    return `${jwt.sign({ code, userId }, secretKey, { expiresIn: maxAge })}`;
  } catch (error) {
    throw error;
  }
};

export async function generateCodeForPlatform(userId: string) {
  try {

    let code = Math.floor(1000 + Math.random() * 9000); //generate random 4 digit code
    await Users.updateOne({ _id: userId }, { $set: { otp: code, otpExpiryTime: new Date(Date.now() + 15 * 60 * 1000) } });

    return generateTokenForEmailVerification(code as number, userId);

  } catch (error) {
    throw new Error("Unable to get the platform");
  }
}

export async function sendVerificationCodeBasedOnPlatform(fullName: string, email: string, userId: string) {
  try {

    const code = await generateCodeForPlatform(userId);

    let mailObj = {};

    mailObj = { name: fullName, code: code, verificationUrl: `${process.env.FRONTEND_BASE_URL}/verify?userId=${userId}&code=${code}` };

    // Send email with user information
    let templatePath;
    templatePath = path.resolve(
      __dirname,
      "../../../views/register.template.ejs"
    );

    await SendMail(templatePath, "Welcome to Crush Cost", email, mailObj);

  } catch (error) {
    throw error;
  }
}

export async function verifyJwtToken(code: string, userId: string): Promise<boolean> {
  try {
    const secret: any = process.env.JWT_SECRET_KEY;
    const user = await Users.findById(userId);
    if (!user) return false;

    return new Promise<boolean>((resolve) => {
      jwt.verify(code, secret, (err: any, decoded: any) => {

        if (decoded.code != user.otp) {
          throw new Error("Invalid code");
        }

        if (err) {
          if (err.name === "TokenExpiredError") {
            throw new Error("Verification code has expired");
          }

          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

export async function sendResetPasswordMail(fullName: string, email: string, userId: string) {
  try {

    let code: any = Math.floor(1000 + Math.random() * 9000);
    await Users.updateOne({ _id: userId }, { $set: { otp: code } });

    let mailObj = {};

    const maxAge = 15 * 60; //valid for 15 minutes
    const secretKey = process.env.JWT_SECRET_KEY as string;
    code = `${jwt.sign({ code, userId }, secretKey, { expiresIn: maxAge })}`;

    mailObj = { name: fullName, code: code, verificationUrl: `${process.env.FRONTEND_BASE_URL + '/reset-password'}?userId=${userId}&code=${code}` };

    // Send email with user information
    let templatePath;
    templatePath = path.resolve(
      __dirname,
      "../../../views/forgetPassword.template.ejs"
    );

    await SendMail(templatePath, "Reset Password", email, mailObj);

  } catch (error) {
    throw error;
  }
}

export const checkIfSubscribed = async (userId: string) => {
  try {
    const checkRole = await Users.findOne({
      _id: userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });
    // const checkIfSubscribed = await UserSubscription.findOne({ userId: userId, status: 'active', isActive: true });
    // const checkIfSubscribed = await UserSubscription.findOne({
    //   userId: userId,
    //   isActive: true
    // }).sort({ createdAt: -1 });
    if (checkRole && checkRole.role == 'admin') return true;
    if (!checkIfSubscribed) return false;
    // if (checkIfSubscribed.isActive) return true;
    else return false;
  } catch (error) {
    throw error;
  }
}