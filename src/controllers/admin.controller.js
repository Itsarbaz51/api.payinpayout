import Prisma from "../db/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

// POST /users/approve
const approveUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await Prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await Prisma.auditLog.create({
    data: { userId: req.user.id, action: `Approved user ${userId}` },
  });

  res.status(200).json(new ApiResponse(200, "User approved", user));
});

// POST /users/block
const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await Prisma.user.update({
    where: { id: userId },
    data: { status: "BLOCKED" },
  });

  await Prisma.auditLog.create({
    data: { userId: req.user.id, action: `Blocked user ${userId}` },
  });

  res.status(200).json(new ApiResponse(200, "User blocked", user));
});

// GET /users/list
const listUsers = asyncHandler(async (req, res) => {
  const { role, status } = req.query;

  const users = await Prisma.user.findMany({
    where: {
      ...(role && { role }),
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(new ApiResponse(200, "Users fetched", users));
});

export { blockUser, approveUser, listUsers };
