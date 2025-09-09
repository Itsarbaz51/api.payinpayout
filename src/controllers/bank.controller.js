import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

export const addBank = asyncHandler(async (req, res) => {
  const { accountHolder, accountNumber, ifscCode, bankName } = req.body;

  const userId = req.user.id;

  if (!userId) return ApiError.send(res, 403, "Unauthoraied user");

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

  const bankDetail = await Prisma.bankDetail.create({
    data: {
      userId,
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      passbookImage: passbookPath,
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Bank details submitted successfully (Pending verification)",
        bankDetail
      )
    );
});

export const verifyBank = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bankDetail = await Prisma.bankDetail.findUnique({ where: { id } });
  if (!bankDetail) {
    return ApiError.send(res, 404, "Bank detail not found");
  }

  const updated = await Prisma.bankDetail.update({
    where: { id },
    data: { isVerified: true },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Bank verified successfully", updated));
});

export const getAdminBank = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return ApiError.send(res, 403, "Unauthorized user");
  }

  const user = await Prisma.user.findUnique({
    where: { id: userId },
    select: { parentId: true },
  });

  if (!user || !user.parentId) {
    return ApiError.send(res, 403, "No parent admin linked to this user");
  }

  const adminBank = await Prisma.bankDetail.findFirst({
    where: { userId: user.parentId },
  });

  if (!adminBank) {
    return ApiError.send(res, 404, "Admin bank details not found");
  }
  
  const data = {
    accountHolder: adminBank.accountHolder,
    accountNumber: adminBank.accountNumber,
    ifscCode: adminBank.ifscCode,
    bankName: adminBank.bankName,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Admin bank account fetched successfully", data)
    );
});
