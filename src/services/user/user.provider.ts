import Users from "../../models/users.model";
import { GenResObj } from "../../utils/responseFormatter.util";
import { HttpStatusCodes as Code } from "../../utils/Enums.util";
import { checkIfSubscribed, createToken, generateBcryptPassword, sendResetPasswordMail, sendVerificationCodeBasedOnPlatform, verifyJwtToken } from "./user.helper";
import bcrypt from "bcrypt";
import { TUserModel } from "./user.interface";
import { changePasswordValidatorType, deactivateAccountType, forgetPasswordValidatorType, getAllUserType, getUserByIdType, getUserDetailsType, resetPasswordValidatorType, signInType, signUpType, updatePasswordType, updateUserType, verifyUserValidatorType, deleteUserAccountType, CreateUserType } from "./user.validate";
import { upload } from "../../utils/cloudinary.util";
import { generateRandomPassword, sendEmailForVerification } from "../admin/admin.helper";

export const signupUser = async (payload: signUpType) => {
  try {

    const email = payload.email.toLowerCase().trim();
    payload.email = payload.email.toLowerCase().trim();

    const checkUser: any = await Users.findOne({
      email: email,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });
    payload.password = await generateBcryptPassword(payload.password);

    if (checkUser && checkUser.isVerified == false) {
      await sendVerificationCodeBasedOnPlatform(checkUser.fullName, email, checkUser._id as string);
      return GenResObj(
        Code.CREATED,
        false,
        `Verification code sent to ${email}`,
      );
    }

    if (checkUser) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        `User with email ${email} already exists`
      );
    }

    const createUser = await Users.create({ ...payload, role: "user" });

    await sendVerificationCodeBasedOnPlatform(createUser.fullName, email, createUser._id as string);

    return GenResObj(Code.CREATED, true, "User created successfully", createUser);

  } catch (error) {
    throw error;
  }
};

export const signinUser = async (payload: signInType) => {
  try {

    const { email, password, platform } = payload;

    let userFilter: any = {
      email: email.toLowerCase(),
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    };

    if (platform === 'admin') {
      userFilter.role = { $in: ['admin', 'superAdmin'] };
    }

    let checkAvlUser: any = await Users.findOne(
      userFilter,
      {
        password: 1,
        role: 1,
        isVerified: 1,
        _id: 1,
        fullName: 1,
        profilePicture: 1,
        status: 1,
        freeAccess: 1
      }
    );

    if (!checkAvlUser) {
      const message =
        platform === 'admin'
          ? "Access denied. Admin credentials required."
          : "User not found";

      return GenResObj(Code.BAD_REQUEST, false, message);
    }

    if (!checkAvlUser.isVerified) {
      return GenResObj(Code.BAD_REQUEST, false, "User is not verified. Please verify your email");
    }

    if (checkAvlUser.status === "INACTIVE") {
      return GenResObj(Code.BAD_REQUEST, false, "User is inactive. Please contact admin");
    }

    const checkPassword = await bcrypt.compare(
      password,
      checkAvlUser.password
    );

    if (!checkPassword) {
      return GenResObj(Code.BAD_REQUEST, false, "Invalid credentials");
    }

    let token;
    if (checkAvlUser && checkAvlUser._id) {
      token = createToken(checkAvlUser._id.toString(), checkAvlUser.role);
    }

    const ifSubscribed = await checkIfSubscribed(checkAvlUser._id);

    // Append token in checkAvlUser object
    const userResponse = { ...checkAvlUser.toObject(), token, isSubscribed: ifSubscribed };
    delete userResponse.password;

    return GenResObj(
      Code.CREATED, true, "User logged in successfully", userResponse
    );
  } catch (error) {
    throw error;
  }
};

export const forgetPassword = async (payload: forgetPasswordValidatorType) => {
  try {

    const { email } = payload;

    const checkAvlUser = await Users.findOne(
      {
        email: email.toLowerCase(),
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } }
        ]
      },
      { email: 1, fullName: 1 }
    );

    if (!checkAvlUser) {
      return GenResObj(Code.BAD_REQUEST, false, "User not found");
    }

    await sendResetPasswordMail(checkAvlUser.fullName, email, checkAvlUser._id as string);

    return GenResObj(
      Code.CREATED, true, "Password reset link sent successfully"
    );
  } catch (error) {
    throw error;
  }
};

export const verifyUser = async (payload: verifyUserValidatorType) => {
  try {

    const { code, userId } = payload;

    let checkAvlUser: TUserModel | null = await Users.findById(userId);

    if (!checkAvlUser) {
      return GenResObj(Code.BAD_REQUEST, false, "User not found");
    }

    if (checkAvlUser.isVerified) {
      return GenResObj(Code.BAD_REQUEST, false, "User already verified");
    }

    if (!await verifyJwtToken(code as string, checkAvlUser._id as string)) {
      return GenResObj(
        Code.BAD_REQUEST, true, "Invalid code"
      );
    }

    checkAvlUser.isVerified = true;
    await checkAvlUser.save();

    return GenResObj(
      Code.CREATED, true, "User verified successfully", checkAvlUser
    );
  } catch (error) {
    throw error;
  }
};

export const verifyUserByOTP = async (payload: verifyUserValidatorType) => {
  try {

    const { code, userId } = payload;

    let checkAvlUser = await Users.findById(userId);

    if (!checkAvlUser) {
      return GenResObj(Code.BAD_REQUEST, false, "User not found");
    }

    const checkOTP = await Users.findOne({
      otp: code, _id: userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ], otpExpiryTime: { $gt: new Date() }
    });
    if (!checkOTP) {
      return GenResObj(Code.BAD_REQUEST, false, "Invalid OTP");
    }

    checkAvlUser.isVerified = true;
    await checkAvlUser.save();

    return GenResObj(
      Code.CREATED, true, "User verified successfully"
    );
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (payload: resetPasswordValidatorType) => {
  try {

    const { code, userId, newPassword } = payload;

    let checkAvlUser = await Users.findById(userId);

    if (!checkAvlUser) {
      return GenResObj(Code.BAD_REQUEST, false, "User not found");
    }

    if (!await verifyJwtToken(code as string, userId)) {
      return GenResObj(
        Code.BAD_REQUEST, true, "Invalid code"
      );
    }

    checkAvlUser.password = await generateBcryptPassword(newPassword);
    await checkAvlUser.save();

    return GenResObj(
      Code.CREATED, true, "Password reset successful"
    );

  } catch (error) {
    throw error;
  }
};

export const changePassword = async (payload: changePasswordValidatorType) => {
  try {

    const { userId, password } = payload;

    const checkUser = await Users.findById(userId);
    if (!checkUser) {
      return GenResObj(Code.BAD_REQUEST, false, "User not found");
    }

    checkUser.password = await generateBcryptPassword(password);
    await checkUser.save();

    return GenResObj(
      Code.CREATED, true, "Password changed successfully"
    );

  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (payload: updatePasswordType) => {
  try {

    const { userId, oldPassword, newPassword }: updatePasswordType = payload;

    const checkUser: TUserModel | null = await Users.findById(userId);

    if (!checkUser) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, checkUser.password);

    if (!isPasswordValid) {
      return GenResObj(Code.BAD_REQUEST, false, 'Invalid old password');
    }

    checkUser.password = await generateBcryptPassword(newPassword);
    await checkUser.save();

    return GenResObj(Code.OK, true, 'Password updated successfully');

  } catch (error) {
    throw error;
  }
};

export const getUserDetails = async (payload: getUserDetailsType) => {
  try {

    let getUser = await Users.findOne({
      _id: payload.userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    }, { password: 0 });

    if (!getUser) {
      return GenResObj(
        Code.NO_CONTENT, true, "User info fetched successfully", getUser
      );
    }

    const ifSubscribed = await checkIfSubscribed(payload.userId);

    return GenResObj(
      Code.CREATED, true, "User info fetched successfully", { ...getUser.toObject(), isSubscribed: ifSubscribed }
    );
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (payload: updateUserType) => {
  try {

    const { userId, oldPassword, newPassword }: updateUserType = payload;

    const checkUser: TUserModel | null = await Users.findOne({
      _id: userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });

    if (payload.profilePicture) {
      const { uploadedImageUrl } = await upload(payload.profilePicture);
      if (uploadedImageUrl) {
        payload.profilePicture = uploadedImageUrl;
      }
    }

    if (!checkUser) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not found');
    }

    if (oldPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(oldPassword, checkUser.password);
      if (!isPasswordValid) {
        return GenResObj(Code.BAD_REQUEST, false, 'incorrect old password');
      }
      checkUser.password = await generateBcryptPassword(newPassword);
      checkUser.save();
    }

    const updatedUser = await Users.findOneAndUpdate({
      _id: userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    }, { $set: payload }, { new: true });

    return GenResObj(Code.OK, true, 'User info updated successfully', updatedUser);

  } catch (error) {
    throw error;
  }
};

export const getAllUser = async (payload: getAllUserType) => {
  try {

    const { page = 1, pageSize = 10, search, status, from, to }: any = payload;

    // Build filter conditionally
    let filter: any = {
      $and: [{
        role: { $nin: ['admin', 'superAdmin'] },
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } }
        ]
      }]
    };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }
    if (from && to) {
      filter.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }

    // Fetch users with the constructed filter
    const users = await Users.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            {
              $skip: (page - 1) * pageSize
            },
            {
              $limit: pageSize
            }
          ],
          count: [
            {
              $count: "count"
            }
          ]

        }
      }
    ]).then(([users]) => {
      const { data, count } = users;
      return { data, count: count[0] ? count[0].count : 0 };
    });

    return GenResObj(Code.OK, true, 'User list fetched successfully', users);

  } catch (error) {
    throw error;
  }
};

export const getUserById = async (payload: getUserByIdType) => {
  try {

    const { userId } = payload;

    // Fetch users with the constructed filter
    const getUsers = await Users.findById(userId);

    return GenResObj(Code.OK, true, 'User fetched successfully', getUsers);

  } catch (error) {
    throw error;
  }
};


export const updateUserById = async (payload: updateUserType) => {
  try {

    const { userId }: updateUserType = payload;

    const checkUser: TUserModel | null = await Users.findOne({
      _id: userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });

    if (payload.profilePicture) {
      const { uploadedImageUrl } = await upload(payload.profilePicture);
      if (uploadedImageUrl) {
        payload.profilePicture = uploadedImageUrl;
      }
    }

    if (!checkUser) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not found');
    }

    const updatedUser = await Users.findOneAndUpdate({
      _id: userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    }, { $set: payload }, { new: true });

    return GenResObj(Code.OK, true, 'User info updated successfully', updatedUser);

  } catch (error) {
    throw error;
  };
};

export const deactivateAccount = async (payload: deactivateAccountType) => {
  try {

    const { userId }: deactivateAccountType = payload;

    const checkUser: TUserModel | null = await Users.findOne({
      _id: userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });

    if (!checkUser) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not found');
    }

    const updatedUser = await Users.findOneAndUpdate({
      _id: userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    }, { $set: { status: 'INACTIVE' } }, { new: true });

    return GenResObj(Code.OK, true, 'Account deactivated successfully', updatedUser);

  } catch (error) {
    throw error;
  };
}
export const deleteUserAccount = async (payload: deleteUserAccountType) => {
  try {
    const { userId, userIdForDelete }: deleteUserAccountType = payload;

    const checkUser: TUserModel | null = await Users.findOne({
      _id: userIdForDelete || userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });

    if (!checkUser) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not found');
    }

    const deletedUser = await Users.findOneAndUpdate({
      _id: userIdForDelete || userId,
    }, { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: userId } }, { new: true });

    return GenResObj(Code.OK, true, 'User Account deleted successfully', deletedUser);

  } catch (error) {
    throw error;
  };
}

export const checkUserFreeAccess = async (payload: getUserDetailsType) => {
  try {
    const getUser = await Users.findOne(
      {
        _id: payload.userId,
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } }
        ]
      },
      {
        freeAccess: 1,
        _id: 1,
        role: 1,
        fullName: 1,
        status: 1,
      }
    ).lean();

    const ifSubscribed = await checkIfSubscribed(payload.userId);

    if (!getUser) {
      return GenResObj(Code.UNAUTHORIZED, false, "User not found", null);
    }

    if (getUser.status == "INACTIVE") {
      return GenResObj(Code.RESTRICTED, false, "User is inactive, Please contact to support", null);
    }

    return GenResObj(Code.CREATED, true, "User info fetched successfully", { ...getUser, isSubscribed: ifSubscribed });
  } catch (error) {
    throw error;
  }
};

export const createUser = async (payload: CreateUserType) => {
  try {
    let { email, fullName, profilePicture } = payload;

    const checkIfUserAlreadyExist = await Users.findOne({
      email,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });
    if (checkIfUserAlreadyExist) {
      return GenResObj(Code.BAD_REQUEST, false, "User already exist");
    }

    const password = generateRandomPassword()

    const bcryptedPassowrd = await generateBcryptPassword(password);

    if (payload.profilePicture) {
      const { uploadedImageUrl } = await upload(payload.profilePicture);
      if (uploadedImageUrl) {
        profilePicture = uploadedImageUrl;
      }
    }

    const createdUserRecord: any = await Users.create({ email: email.toLowerCase().trim(), fullName, password: bcryptedPassowrd, profilePicture, role: "user" });

    sendEmailForVerification(fullName, email, createdUserRecord?._id as string, password);

    return GenResObj(Code.CREATED, true, "User created successfully");
  } catch (error) {
    throw error;
  }
};
