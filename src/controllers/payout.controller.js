import axios from "axios";
import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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

export { addBankWithVerifyApi };
