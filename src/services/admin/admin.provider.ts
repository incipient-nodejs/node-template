import { GenResObj } from "../../utils/responseFormatter.util";
import { HttpStatusCodes as Code } from "../../utils/Enums.util";
import Users from "../../models/users.model";
import { CreateAdminType, DeleteAdminType, GetAllAdminType, UpdateAdminType } from "./admin.validate";
import { generateRandomPassword, sendEmailForVerification } from "./admin.helper";
import { generateBcryptPassword } from "../user/user.helper";
import { upload } from "../../utils/cloudinary.util";

export const createAdmin = async (payload: CreateAdminType) => {
  try {
    let { email, fullName, profilePicture } = payload;

    const checkIfAdminAlreadyExist = await Users.findOne({
      email,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });
    if (checkIfAdminAlreadyExist) {
      return GenResObj(Code.BAD_REQUEST, false, "Admin already exist");
    }

    const password = generateRandomPassword()

    const bcryptedPassowrd = await generateBcryptPassword(password);

    if (payload.profilePicture) {
      const { uploadedImageUrl } = await upload(payload.profilePicture);
      if (uploadedImageUrl) {
        profilePicture = uploadedImageUrl;
      }
    }

    const createdAdminRecord: any = await Users.create({ email: email.toLowerCase().trim(), fullName, password: bcryptedPassowrd, profilePicture, role: "admin" });

    sendEmailForVerification(fullName, email, createdAdminRecord?._id as string, password);

    return GenResObj(Code.CREATED, true, "Admin created successfully");
  } catch (error) {
    throw error;
  }
};

export const updateAdmin = async (payload: UpdateAdminType) => {
  try {
    const { adminId } = payload;

    const checkAdminExists = await Users.findOne({
      _id: adminId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });
    if (!checkAdminExists) {
      return GenResObj(Code.BAD_REQUEST, false, "Admin does not exist");
    }

    if (payload.profilePicture) {
      const { uploadedImageUrl } = await upload(payload.profilePicture);
      if (uploadedImageUrl) {
        payload.profilePicture = uploadedImageUrl;
      }
    }

    const updatedAdmin = await Users.findByIdAndUpdate(adminId, { ...payload, role: checkAdminExists?.role }, {
      new: true,
    });

    return GenResObj(Code.OK, true, "Admin updated successfully", updatedAdmin);
  } catch (error) {
    throw error;
  }
};

export const getAllAdmins = async (payload: GetAllAdminType) => {
  try {
    const { page = 1, pageSize = 10, search } = payload;

    const allAdminData = await Users.aggregate([
      {
        $match: {
          $and: [
            { role: "admin" },
            {
              $or: [
                { isDeleted: false },
                { isDeleted: { $exists: false } }
              ]
            },
            ...(search
              ? [{
                $or: [
                  { email: { $regex: search, $options: "i" } },
                  { fullName: { $regex: search, $options: "i" } },
                  { status: { $regex: search, $options: "i" } }
                ]
              }]
              : [])
          ]
        },
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $facet: {
          data: [
            {
              $skip: (Number(page) - 1) * Number(pageSize),
            },
            {
              $limit: Number(pageSize),
            },
          ],
          count: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]).then(([data]) => {
      const { data: allAdminData, count } = data;
      return { data: allAdminData, count: count?.[0] ? count?.[0]?.count : 0 };
    });

    return GenResObj(Code.OK, true, "Data fetched successfully", allAdminData);
  } catch (error) {
    throw error;
  }
};

export const deleteAdmin = async (payload: DeleteAdminType) => {
  try {
    const { adminId, userId } = payload;

    const checkAdminExists = await Users.findOne({
      _id: adminId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    });
    if (!checkAdminExists) {
      return GenResObj(Code.BAD_REQUEST, false, "Admin does not exist or has been deleted");
    }

    const deletedAdmin = await Users.findOneAndUpdate(
      {
        _id: adminId,
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } }
        ]
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
      },
      {
        new: true
      }
    );

    return GenResObj(Code.OK, true, "Admin deleted successfully", deletedAdmin);
  } catch (error) {
    throw error;
  }
};

