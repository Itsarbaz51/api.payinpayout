import express from "express";
import {
  addCommission,
  deleteCommission,
  getCommissions,
  updateCommission,
} from "../controllers/commission.controller.js";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/add-commission",
  isAuthenticated,
  authorizeRoles(["ADMIN"]),
  addCommission
);

router.put(
  "/update-commission/:id",
  isAuthenticated,
  authorizeRoles(["ADMIN"]),
  updateCommission
);

router.get("/get-user-commissions/:userId", isAuthenticated, getCommissions);
router.delete("/delete-commissions/:userId", isAuthenticated, deleteCommission);

export default router;
