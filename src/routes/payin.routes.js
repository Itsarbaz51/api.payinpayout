import express from "express";
import { initiatePayin, payinCallback, getPayinStatus } from "../controllers/payin.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/initiate", isAuthenticated, initiatePayin);
router.post("/callback", payinCallback);
router.get("/status/:txnId", isAuthenticated, getPayinStatus);

export default router;
