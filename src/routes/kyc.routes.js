import express from "express";
import { createKyc, getAllKyc, verifyKyc } from "../controllers/kyc.controller.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.middleware.js";
import { kycUpload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/create-kyc",
  isAuthenticated,
  kycUpload.fields([
    { name: "aadhaarImageFront", maxCount: 1 },
    { name: "aadhaarImageBack", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "shopAddressImage", maxCount: 1 },
  ]),
  createKyc
);

router.put("/verify/:id", isAuthenticated, authorizeRoles(["ADMIN"]), verifyKyc);
router.get("/get-all-kyc", isAuthenticated, authorizeRoles(["ADMIN"]), getAllKyc);

export default router;
