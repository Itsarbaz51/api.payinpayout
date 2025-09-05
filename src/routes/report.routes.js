import express from "express";
import { getAllTransactions, getAuditLogs, getCommissionReport } from "../controllers/report.controller.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/transactions", isAuthenticated, authorizeRoles("ADMIN", "SUPER_ADMIN"), getAllTransactions);
router.get("/audit", isAuthenticated, authorizeRoles("SUPER_ADMIN"), getAuditLogs);
router.get("/commissions", isAuthenticated, authorizeRoles("SUPER_ADMIN"), getCommissionReport);

export default router;
