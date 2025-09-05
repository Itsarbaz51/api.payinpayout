import express from "express";
import {
  authorizeRoles,
  isAuthenticated,
} from "../middlewares/auth.middleware.js";
import { bankUpload } from "../middlewares/multer.middleware.js";
import { addBank, verifyBank } from "../controllers/bank.controller.js";

const router = express.Router();

router.post(
  "/add-bank",
  isAuthenticated,
  bankUpload.fields([{ name: "passbookImage", maxCount: 1 }]),
  addBank
);
router.put(
  "/verify/:id",
  isAuthenticated,
  authorizeRoles(["ADMIN"]),
  verifyBank
);

export default router;
