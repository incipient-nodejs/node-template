import { Router } from "express";
import User from "./user/user.route";
import admin from "./admin/admin.route";

const router = Router();

router.use("/user", User);
router.use("/admin", admin);

export default router;