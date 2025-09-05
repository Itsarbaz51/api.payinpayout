import express from "express";
import { approveUser, blockUser, listUsers } from "../controllers/admin.controller.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/approve", isAuthenticated, authorizeRoles("SUPER_ADMIN"), approveUser);
router.post("/block", isAuthenticated, authorizeRoles("SUPER_ADMIN", "ADMIN"), blockUser);
router.get("/list", isAuthenticated, authorizeRoles("SUPER_ADMIN", "ADMIN"), listUsers);

export default router;
