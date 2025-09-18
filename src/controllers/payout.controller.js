import axios from "axios";
import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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

// bank add and verified
const addBankWithVerifyApi = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { accountHolder, accountNumber, ifscCode, bankName } = req.body;

  const userId = req.user?.id;

  if (!userId) return ApiError.send(res, 403, "Unauthorized user");

  if (!accountHolder || !accountNumber || !ifscCode) {
    return ApiError.send(
      res,
      422,
      "Account Holder, Account Number, IFSC Code required"
    );
  }

  const passbookPath = req.files?.passbookImage?.[0]?.path;
  if (!passbookPath) {
    return ApiError.send(res, 422, "Passbook image is required");
  }

  const existingBank = await Prisma.bankDetail.findUnique({
    where: { accountNumber },
  });

  if (existingBank) {
    return ApiError.send(res, 409, "Bank account already registered");
  }

  // try {
  const txnid = Date.now();

  const response = await axios.post(
    process.env.URL_BANK_VERIFY,
    {
      ifsc: ifscCode,
      account: accountNumber,
      name: accountHolder,
      txnid: txnid,
    },
    {
      headers: {
        "api-key": process.env.API_KEY_BANK_VERIFY,
        "api-secret-key": process.env.API_SECRET_KEY_BANK_VERIFY,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("response.data0", response.data);

  if (response.data.status !== "SUCCESS") {
    return ApiError.send(
      res,
      400,
      `Bank verification failed: ${response.data.msg || "Unknown error"}`
    );
  }
  // } catch (error) {
  //   console.error("Bank Verification Error:", error?.response?.data || error);
  //   return ApiError.send(
  //     res,
  //     500,
  //     "Bank verification service unavailable. Try again later."
  //   );
  // }

  const bankDetail = await Prisma.bankDetail.create({
    data: {
      userId,
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      passbookImage: passbookPath,
      isVerified: true,
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Bank details submitted & verified successfully",
        bankDetail
      )
    );
});

export {
  initiatePayout,
  payoutCallback,
  getPayoutStatus,
  addBankWithVerifyApi,
};
