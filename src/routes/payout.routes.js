import express from "express";
import { addBankWithVerifyApi } from "../controllers/payout.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/verify-add-bank", isAuthenticated, addBankWithVerifyApi);

export default router;
