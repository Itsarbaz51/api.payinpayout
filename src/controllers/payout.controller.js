import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

const initiatePayout = asyncHandler(async (req, res) => {
  const {
    amount,
    accountNumber,
    ifsc,
    provider = "RAZORPAY_PAYOUT",
  } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) return ApiError.send(res, 400, "Invalid amount");

  // Check wallet balance
  const wallet = await Prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || wallet.balance < amount) {
    return ApiError.send(res, 400, "Insufficient wallet balance");
  }

  // Deduct balance immediately (Hold)
  await Prisma.wallet.update({
    where: { userId },
    data: { balance: { decrement: amount } },
  });

  await Prisma.walletTransaction.create({
    data: {
      userId,
      amount,
      type: "DEBIT",
      description: "Payout request initiated",
    },
  });

  // Generate internal request id
  const requestId = `payout_${Date.now()}`;

  // Save payout request
  const txn = await Prisma.payoutTransaction.create({
    data: {
      userId,
      amount,
      accountNumber,
      ifsc,
      provider,
      requestId,
      status: "PENDING",
    },
  });

  // Normally here → call PG payout API (RazorpayX, Cashfree etc.)
  res.status(200).json(new ApiResponse(200, "Payout initiated", txn));
});

// POST /payout/callback
const payoutCallback = asyncHandler(async (req, res) => {
  const { requestId, utr, status, meta } = req.body;

  const txn = await Prisma.payoutTransaction.findUnique({
    where: { requestId },
  });
  if (!txn) return ApiError.send(res, 404, "Transaction not found");

  let newStatus = "FAILED";
  if (status === "SUCCESS") newStatus = "SUCCESS";

  const updatedTxn = await Prisma.payoutTransaction.update({
    where: { requestId },
    data: {
      status: newStatus,
      utr,
      meta,
    },
  });

  // If payout failed → refund wallet
  if (newStatus === "FAILED") {
    await Prisma.wallet.update({
      where: { userId: txn.userId },
      data: { balance: { increment: txn.amount } },
    });

    await Prisma.walletTransaction.create({
      data: {
        userId: txn.userId,
        amount: txn.amount,
        type: "CREDIT",
        description: "Payout refund (failed)",
      },
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Payout callback processed", updatedTxn));
});

// GET /payout/status/:txnId
const getPayoutStatus = asyncHandler(async (req, res) => {
  const { txnId } = req.params;

  const txn = await Prisma.payoutTransaction.findUnique({
    where: { id: txnId },
  });
  if (!txn) return ApiError.send(res, 404, "Transaction not found");

  res.status(200).json(new ApiResponse(200, "Payout status fetched", txn));
});

export { initiatePayout, payoutCallback, getPayoutStatus };
