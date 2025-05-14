import { Router } from "express";
import { adminController as AdminController } from "./admin.controller";
import { authCheck } from "../../middleware/jwt-token.middleware";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.use(authCheck(["superAdmin"]));

router.route("/create-admin").post(upload.single('profilePicture'), AdminController.createAdmin);
router.route("/update-admin").put(upload.single('profilePicture'), AdminController.updateAdmin);
router.route("/getAll-admin").get(AdminController.getAllAdmins);
router.route("/delete-admin/:adminId").delete(AdminController.deleteAdmin);

export default router;