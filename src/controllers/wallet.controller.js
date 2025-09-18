import { log } from "console";
import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
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
  let { amount, provider, paymentId, orderId } = req.body;

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

  amount = parseFloat(amount);
  if (isNaN(amount) || amount <= 0) {
    return ApiError.send(res, 400, "Amount must be a valid number > 0");
  }

  const paymentImagePath = req.files?.paymentImage?.[0]?.path;
  if (provider === "BANK_TRANSFER" && !paymentImagePath) {
    return ApiError.send(
      res,
      422,
      "Payment image is required for bank transfer"
    );
  }

  // Duplicate check (paymentId OR orderId)
  const existingFund = await Prisma.walletTopup.findFirst({
    where: {
      OR: [{ paymentId }, { orderId }],
    },
  });

  if (existingFund) {
    return ApiError.send(res, 403, "This fund request already exists");
  }

  const topup = await Prisma.walletTopup.create({
    data: {
      userId,
      orderId,
      paymentId,
      amount,
      paymentImage: paymentImagePath || null,
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
  const { id, role } = req.user;
  const type = req.body.trnType;

  if (!id) {
    return ApiError.send(res, 403, "Unauthorized user access");
  }
  if (!type) {
    return ApiError.send(res, 400, "Transaction type is required");
  }

  const trnType = type.toUpperCase();
  console.log("Transaction Type:", trnType);

  let userIds = [];

  if (role === "ADMIN") {
    // Fetch all users under this admin
    const users = await Prisma.user.findMany({
      where: { parentId: id }, // or add subParentId if needed
      select: { id: true },
    });
    userIds = users.map((u) => u.id);

    if (userIds.length === 0) {
      return ApiError.send(res, 404, "No users under this admin");
    }
  } else {
    // Normal user
    userIds = [id];
  }

  // Fetch transactions
  const transactions = await Prisma.walletTopup.findMany({
    where: {
      userId: { in: userIds },
      ...(["VERIFIED", "PENDING", "REJECTED"].includes(trnType)
        ? { status: trnType }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("Transactions Found:", transactions.length);

  if (!transactions || transactions.length === 0) {
    return ApiError.send(res, 404, `No transactions found for type ${trnType}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Wallet transactions fetched successfully (${trnType})`,
        transactions
      )
    );
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ------------------------- Create Razorpay Order --------------------
export const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const userId = req.user?.id;

  if (!userId) return ApiError.send(res, 402, "Unauthorized user access");

  const amounts = parseFloat(amount);
  if (!amounts || amounts <= 0) {
    return ApiError.send(res, 400, "Amount must be greater than zero");
  }

  const limit = await Prisma.userLimit.findUnique({ where: { userId } });
  if (limit && amounts > limit.maxLimit) {
    return ApiError.send(res, 400, `You can only add up to ₹${limit.maxLimit}`);
  }

  const options = {
    amount: amounts * 100, // in paise
    currency: "INR",
    receipt: `wallet_${Date.now()}`,
    notes: { userId },
  };

  const order = await razorpay.orders.create(options);

  await Prisma.walletTopup.create({
    data: {
      userId,
      orderId: order.id,
      amount: amounts,
      provider: "RAZORPAY",
      status: "VERIFIED",
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
      status: "PENDING", // waiting for admin approval
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Payment verified, waiting for admin approval"));
});

// ---------------- Admin update  Payment -----------------------
export const updateWalletTopupStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const { status } = req.body;

  const topup = await Prisma.walletTopup.findUnique({ where: { id } });
  if (!topup) return ApiError.send(res, 404, "Topup not found");

  if (topup.status !== "PENDING") {
    return ApiError.send(res, 400, "This topup is already processed");
  }

  let updatedUser = null;

  if (status === "APPROVED") {
    updatedUser = await Prisma.user.update({
      where: { id: topup.userId },
      data: { walletBalance: { increment: topup.amount } },
    });
  } else if (status === "REJECTED") {
    await Prisma.walletTopup.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Topup rejected successfully", null));
  }

  await Prisma.walletTopup.update({
    where: { id },
    data: { status },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Topup ${status.toLowerCase()} successfully`,
        updatedUser
      )
    );
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
