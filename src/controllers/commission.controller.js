import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
const setCommission = asyncHandler(async (req, res) => {
  const { userId, role, service, type, value } = req.body;

  if (!service || !type || !value) {
    return ApiError.send(res, 400, "Service, type and value are required");
  }

  const commission = await Prisma.commission.upsert({
    where: {
      // unique check: either by userId+service or role+service
      id: userId ? `${userId}_${service}` : `${role}_${service}`,
    },
    update: {
      type,
      value,
    },
    create: {
      userId,
      role,
      service,
      type,
      value,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Commission set successfully", commission));
});

const getCommission = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await Prisma.user.findUnique({ where: { id: userId } });
  if (!user) return ApiError.send(res, 404, "User not found");

  // priority: user-specific commission > role-based commission
  const commissions = await Prisma.commission.findMany({
    where: {
      OR: [{ userId: userId }, { role: user.role }],
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Commission details fetched", commissions));
});

const getRoleCommission = asyncHandler(async (req, res) => {
  const { role } = req.params;

  const commissions = await Prisma.commission.findMany({
    where: { role },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Role commission fetched", commissions));
});

export { setCommission, getCommission, getRoleCommission };
