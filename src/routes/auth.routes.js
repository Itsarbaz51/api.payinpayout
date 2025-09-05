import express from "express";
import {
  publicRegister,
  roleBasedRegister,
  login,
  logout,
  getSingleAuth,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/public-register", publicRegister);
router.post("/role-base-register", isAuthenticated, roleBasedRegister);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getSingleAuth);

export default router;
