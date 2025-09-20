import axios from "axios";
import asyncHandler from "../utils/asyncHandler.js";
import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const API_URL_VERIFY = process.env.API_URL_BANK_VERIFY;
const API_URL_PAYOUT = process.env.API_URL_BANK_PAYOUT;

const API_HEADERS = {
  "api-key": process.env.API_KEY_BANK_VERIFY,
  "api-secret-key": process.env.API_SECRET_KEY_BANK_VERIFY,
  "Content-Type": "application/json",
};

export const getBanksByMobile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const phone = req.body;
  if (!userId) return ApiError.send(res, 403, "Unauthorized user");

  if (!phone) return ApiError.send(res, 403, "phone number is required");

  const banks = await Prisma.bankDetail.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse.send(res, 200, "Banks fetched successfully", banks);
});

export const addBankWithVerifyApi = asyncHandler(async (req, res) => {
  const { ifsc, accountNumber, phone } = req.body;
  const userId = req.user?.id;
  if (!userId) return ApiError.send(res, 403, "Unauthorized user");

  if (!ifsc || !accountNumber || !phone)
    return ApiError.send(res, 422, "IFSC & Account, phone required");

  const existingBank = await Prisma.bankDetail.findFirst({
    where: { accountNumber },
  });

  const txnid = Date.now().toString();

  const response = await axios.post(
    API_URL_VERIFY,
    { ifsc, account, name: "NA", txnid },
    { headers: API_HEADERS }
  );

  if (response.data.status !== "SUCCESS") {
    return ApiError.send(res, 400, `Verification failed: ${response.data.msg}`);
  }

  const { accountHolder, bankName } = response.data;

  if (existingBank) {
    const updatedBank = await Prisma.bankDetail.update({
      where: { id: existingBank.id },
      data: {
        accountHolder,
        bankName,
        isVerified: true,
      },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Bank already exists, verified again", updatedBank)
      );
  }

  const newBank = await Prisma.bankDetail.create({
    data: {
      userId,
      phone,
      accountNumber,
      ifscCode: ifsc,
      bankName,
      accountHolder,
      isVerified: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Bank verified & added successfully", newBank));
});

export const doPayout = asyncHandler(async (req, res) => {
  const { amount, mode, bankId } = req.body;
  const userId = req.user?.id;

  if (!userId) return ApiError.send(res, 403, "Unauthorized user");
  if (!amount || amount <= 0) return ApiError.send(res, 422, "Invalid amount");

  let bank;
  if (bankId) {
    bank = await Prisma.bankDetail.findFirst({ where: { id: bankId, userId } });
  } else {
    bank = await Prisma.bankDetail.findFirst({
      where: { userId, isVerified: true },
    });
  }

  if (!bank) return ApiError.send(res, 404, "No verified bank found");

  const txnid = Date.now().toString();

  const payload = {
    ifsc: bank.ifscCode,
    account_no: bank.accountNumber,
    benName: bank.accountHolder,
    amount: parseInt(amount),
    benMobile: req.user.mobile,
    bankName: bank.bankName,
    mode: mode || "IMPS",
    txnid,
  };

  const response = await axios.post(API_URL_PAYOUT, payload, {
    headers: API_HEADERS,
  });

  if (response.data.status !== "SUCCESS") {
    return ApiError.send(res, 400, `Payout failed: ${response.data.msg}`);
  }

  const payout = await Prisma.payout.create({
    data: {
      userId,
      bankId: bank.id,
      amount: parseFloat(amount),
      txnId: txnid,
      status: "SUCCESS",
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Payout successful", payout));
});
