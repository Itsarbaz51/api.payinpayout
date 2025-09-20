import express from "express";
import { addBankWithVerifyApi, doPayout, getBanksByMobile } from "../controllers/payout.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/banks", isAuthenticated, getBanksByMobile);
router.post("/banks/add", isAuthenticated, addBankWithVerifyApi);
router.post("/transfer", isAuthenticated, doPayout);

export default router;
