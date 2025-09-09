import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import crypto from "crypto";
import Razorpay from "razorpay";

// -------------------- Get Wallet Balance --------------------
export const getWalletBalance = asyncHandler(async (req, res) => {
  const user = await Prisma.user.findUnique({
    where: { id: req.user.id },
    select: { walletBalance: true },
  });

  if (!user) return ApiError.send(res, 404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, "Wallet balance fetched", user));
});

// -------------------- Add Fund --------------------
export const addFunds = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { amount, provider, paymentId, orderId, paymentImage } = req.body;

  if (!userId) {
    return ApiError.send(res, 422, "Unauthorized user");
  }

  if (!amount || !provider || !paymentId || !orderId) {
    return ApiError.send(
      res,
      422,
      "Amount, Provider, PaymentId & OrderId are required"
    );
  }

  if (amount <= 0) {
    return ApiError.send(res, 400, "Amount must be greater than zero");
  }

  // const paymentImagePath = await req.files[0].paymentImage?.path;

  // Create a topup request (status = PENDING by default)
  const topup = await Prisma.walletTopup.create({
    data: {
      userId,
      orderId,
      paymentId,
      amount,
      paymentImage,
      provider,
      status: "PENDING",
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Topup request submitted successfully. Waiting for admin approval.",
        topup
      )
    );
});

// -------------------- Deduct Funds --------------------
export const deductFunds = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    return ApiError.send(res, 400, "Amount must be greater than zero");
  }

  const user = await Prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return ApiError.send(res, 404, "User not found");

  if (user.walletBalance < amount) {
    return ApiError.send(res, 400, "Insufficient wallet balance");
  }

  const updatedUser = await Prisma.user.update({
    where: { id: req.user.id },
    data: { walletBalance: { decrement: amount } },
  });

  await Prisma.walletTransaction.create({
    data: {
      userId: req.user.id,
      type: "DEBIT",
      amount,
      description: description || "Funds deducted",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Funds deducted successfully", updatedUser));
});

// -------------------- Get Wallet Transactions --------------------
export const getWalletTransactions = asyncHandler(async (req, res) => {
  const transactions = await Prisma.walletTransaction.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Wallet transactions fetched", transactions));
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ------------------------- Create Order --------------------
export const createOrder = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const userId = req.user?.id;

  if (!userId) return ApiError.send(res, 402, "Unauthorized user access");

  if (!amount || amount <= 0) {
    return ApiError.send(res, 400, "Amount must be greater than zero");
  }

  const limit = await Prisma.userLimit.findUnique({ where: { userId } });
  if (limit && amount > limit.maxLimit) {
    return ApiError.send(res, 400, `You can only add up to ₹${limit.maxLimit}`);
  }

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `wallet_${Date.now()}`,
    notes: { userId, description },
  };

  const order = await razorpay.orders.create(options);

  await Prisma.walletTopup.create({
    data: {
      userId,
      orderId: order.id,
      amount,
      status: "CREATED",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Order created successfully", order));
});

// ------------------------- Verify Payment --------------------
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const topup = await Prisma.walletTopup.findUnique({
    where: { orderId: razorpay_order_id },
  });

  if (!topup) return ApiError.send(res, 404, "Order not found");

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return ApiError.send(
      res,
      400,
      "Invalid signature, payment verification failed"
    );
  }

  await Prisma.walletTopup.update({
    where: { orderId: razorpay_order_id },
    data: {
      paymentId: razorpay_payment_id,
      status: "PENDING",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Payment verified, waiting for admin approval"));
});

// ---------------- Admin Approves Payment -----------------------
export const approveTopup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topup = await Prisma.walletTopup.findUnique({ where: { id } });
  if (!topup) return ApiError.send(res, 404, "Topup not found");

  if (topup.status !== "PENDING") {
    return ApiError.send(res, 400, "This topup is already processed");
  }

  // Add funds to wallet
  const updatedUser = await Prisma.user.update({
    where: { id: topup.userId },
    data: { walletBalance: { increment: topup.amount } },
  });

  await Prisma.walletTransaction.create({
    data: {
      userId: topup.userId,
      type: "CREDIT",
      amount: topup.amount,
      description: "Wallet Top-up via Razorpay (Admin Approved)",
    },
  });

  // Mark topup as APPROVED
  await Prisma.walletTopup.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Topup approved and funds added", updatedUser));
});

// ---------------- Admin Rejects Payment -----------------------
export const rejectTopup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topup = await Prisma.walletTopup.findUnique({ where: { id } });
  if (!topup) return ApiError.send(res, 404, "Topup not found");

  if (topup.status !== "PENDING") {
    return ApiError.send(res, 400, "This topup is already processed");
  }

  const refund = await razorpay.payments.refund(topup.paymentId, {
    amount: topup.amount * 100,
    speed: "normal",
  });

  await Prisma.walletTopup.update({
    where: { id },
    data: {
      status: "REFUNDED",
      refundId: refund.id,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Topup rejected & refunded"));
});
