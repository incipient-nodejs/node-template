import { Router } from "express";
import { userControler as UserController } from "./user.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

const router = Router();
router.route("/signup").post(UserController.signupUser);
router.route("/signin").post(UserController.signinUser);
router.route("/verify/:userId/:code").get(UserController.verifyUser);
router.route("/forget-password").post(UserController.forgetPassword);
router.route("/reset-password/:userId/:code").post(UserController.resetPassword);
router.route("/change-password").get(UserController.changePassword);
router.route("/update-password").put(authCheck(["user", "admin"]), UserController.updatePassword);

router.route("/update-profile").put(authCheck(["user", "admin", "superAdmin"]), upload.single('profilePicture'), UserController.updateUser);
router.route("/get-user").get(authCheck(["user", "admin", "superAdmin"]), UserController.getUserDetails);
router.route("/get-all-user").get(authCheck(["admin", "superAdmin"]), UserController.getAllUser);
router.route("/get-user/:userId").get(authCheck(["admin", "superAdmin"]), UserController.getAllUser);

router.route("/update-user/:userId").put(authCheck(["admin", "superAdmin"]), upload.single('profilePicture'), UserController.updateUserById);

router.route("/deactivate-account").delete(authCheck(["user"]), UserController.deactivateAccount);
router.route("/delete-user-account").delete(authCheck(["user", "admin", "superAdmin"]), UserController.deleteUserAccount);
router.route("/check-free-access").get(authCheck(["user", "admin", "superAdmin"]), UserController.checkUserFreeAccess);

//apis for Admin panel
router.route("/create-user").post(authCheck(["admin", "superAdmin"]), upload.single('profilePicture'), UserController.createUser);


export default router;