import express from "express";
import { initiatePayout, payoutCallback, getPayoutStatus } from "../controllers/payout.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/initiate", isAuthenticated, initiatePayout);
router.post("/callback", payoutCallback);
router.get("/status/:txnId", isAuthenticated, getPayoutStatus);

export default router;
