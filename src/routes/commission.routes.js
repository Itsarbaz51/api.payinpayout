import express from "express";
import { setCommission, getCommission } from "../controllers/commission.controller.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/set", isAuthenticated, authorizeRoles("SUPER_ADMIN"), setCommission);
router.get("/:userId", isAuthenticated, getCommission);

export default router;
