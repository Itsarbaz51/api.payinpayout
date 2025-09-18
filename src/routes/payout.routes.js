import express from "express";
import { initiatePayout, payoutCallback, getPayoutStatus, addBankWithVerifyApi } from "../controllers/payout.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { bankUpload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/initiate", isAuthenticated, initiatePayout);
router.post("/callback", payoutCallback);
router.get("/status/:txnId", isAuthenticated, getPayoutStatus);
router.post("/verify-add-bank", isAuthenticated, bankUpload.fields([{ name: "passbookImage", maxCount: 1 }]), addBankWithVerifyApi);

export default router;
