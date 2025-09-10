import express from "express";
import {
  getWalletBalance,
  addFunds,
  deductFunds,
  getWalletTransactions,
  rejectTopup,
  approveTopup,
  verifyPayment,
  createOrder,
} from "../controllers/wallet.controller.js";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { walletUpload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Get balance
router.get("/balance", isAuthenticated, getWalletBalance);

// Add funds (Admin only)
router.post(
  "/add-fund",
  isAuthenticated,
  walletUpload.fields([{ name: "paymentImage", maxCount: 1 }]),
  addFunds
);

// Deduct funds (user himself)
router.post("/deduct-funds", isAuthenticated, deductFunds);

// Get transactions
router.get("/transactions", isAuthenticated, getWalletTransactions);

router.post("/create-order", isAuthenticated, createOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);

router.post("/get-all-transactions", isAuthenticated, authorizeRoles(["ADMIN"]), getWalletTransactions)

// Admin only
router.put(
  "/approve/:id",
  isAuthenticated,
  authorizeRoles(["ADMIN"]),
  approveTopup
);
router.put(
  "/reject/:id",
  isAuthenticated,
  authorizeRoles(["ADMIN"]),
  rejectTopup
);

export default router;
