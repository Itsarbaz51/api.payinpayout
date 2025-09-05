import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import Prisma from "../db/db.js";

// Create or Update Limit
export const setUserLimit = asyncHandler(async (req, res) => {
  const { userId, maxLimit } = req.body;

  if (!userId || !maxLimit) {
    return ApiError.send(res, 422, "userId and maxLimit are required");
  }

  const limit = await Prisma.userLimit.upsert({
    where: { userId },
    update: { maxLimit },
    create: { userId, maxLimit },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "User limit set successfully", limit));
});

// Get Limit by User
export const getUserLimit = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const limit = await Prisma.userLimit.findUnique({ where: { userId } });
  if (!limit) return ApiError.send(res, 404, "Limit not found");

  return res
    .status(200)
    .json(new ApiResponse(200, "User limit fetched successfully", limit));
});

// Get All Limits
export const getAllLimits = asyncHandler(async (req, res) => {
  const limits = await Prisma.userLimit.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "All user limits fetched", limits));
});

// Delete Limit
export const deleteUserLimit = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const limit = await Prisma.userLimit
    .delete({ where: { userId } })
    .catch(() => null);
  if (!limit) return ApiError.send(res, 404, "Limit not found");

  return res
    .status(200)
    .json(new ApiResponse(200, "User limit deleted successfully", limit));
});
