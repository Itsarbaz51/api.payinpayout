import express from "express";
import {
  createUser,
  getAllUsers,
  // createAgent,
  // createDistributor,
} from "../controllers/user.controller.js";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/create-admin",
  isAuthenticated,
  authorizeRoles("SUPER_ADMIN"),
  createUser
);
// router.post(
//   "/create-agent",
//   isAuthenticated,
//   authorizeRoles("ADMIN"),
//   createAgent
// );
// router.post(
//   "/create-distributor",
//   isAuthenticated,
//   authorizeRoles("MASTER_DISTRIBUTOR"),
//   createDistributor
// );

router.get(
  "/get-all-users",
  isAuthenticated,
  authorizeRoles("ADMIN"),
  getAllUsers
);

export default router;
