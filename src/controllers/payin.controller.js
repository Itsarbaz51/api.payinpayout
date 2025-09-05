import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

const initiatePayin = asyncHandler(async (req, res) => {
  const { amount, provider = "RAZORPAY" } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) return ApiError.send(res, 400, "Invalid amount");

  // Example: Razorpay order create (replace with actual SDK/API call)
  const orderId = `order_${Date.now()}`;

  const txn = await Prisma.payinTransaction.create({
    data: {
      userId,
      amount,
      provider,
      orderId,
      status: "PENDING",
    },
  });

  res.status(200).json(
    new ApiResponse(200, "Payin initiated", {
      orderId: txn.orderId,
      amount: txn.amount,
      provider: txn.provider,
    })
  );
});

const payinCallback = asyncHandler(async (req, res) => {
  const { orderId, paymentId, status, meta } = req.body;

  const txn = await Prisma.payinTransaction.findUnique({ where: { orderId } });
  if (!txn) return ApiError.send(res, 404, "Transaction not found");

  let newStatus = "FAILED";
  if (status === "SUCCESS") newStatus = "SUCCESS";

  const updatedTxn = await Prisma.payinTransaction.update({
    where: { orderId },
    data: {
      paymentId,
      status: newStatus,
      meta,
    },
  });

  // ✅ Wallet credit only if SUCCESS
  if (newStatus === "SUCCESS") {
    await Prisma.wallet.update({
      where: { userId: txn.userId },
      data: {
        balance: { increment: txn.amount },
      },
    });

    await Prisma.walletTransaction.create({
      data: {
        userId: txn.userId,
        amount: txn.amount,
        type: "CREDIT",
        referenceId: txn.id,
        description: `Payin via ${txn.provider}`,
      },
    });
  }

  res.status(200).json(new ApiResponse(200, "Callback processed", updatedTxn));
});

const getPayinStatus = asyncHandler(async (req, res) => {
  const { txnId } = req.params;

  const txn = await Prisma.payinTransaction.findUnique({
    where: { id: txnId },
  });
  if (!txn) return ApiError.send(res, 404, "Transaction not found");

  res.status(200).json(new ApiResponse(200, "Transaction status fetched", txn));
});

export { initiatePayin, payinCallback, getPayinStatus };
