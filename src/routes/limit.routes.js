import express from "express";
import {
  setUserLimit,
  getUserLimit,
  getAllLimits,
  deleteUserLimit,
} from "../controllers/limit.controller.js";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// ADMIN only routes
router.post("/set", isAuthenticated, authorizeRoles(["ADMIN"]), setUserLimit);
router.get("/all", isAuthenticated, authorizeRoles(["ADMIN"]), getAllLimits);
router.get(
  "/:userId",
  isAuthenticated,
  authorizeRoles(["ADMIN"]),
  getUserLimit
);
router.delete(
  "/:userId",
  isAuthenticated,
  authorizeRoles(["ADMIN"]),
  deleteUserLimit
);

export default router;
