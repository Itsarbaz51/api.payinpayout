import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { hashPassword } from "../utils/lib.js";

// ✅ Role hierarchy map
const roleHierarchy = {
  SUPER_ADMIN: ["API_HOLDER", "ADMIN"],
  API_HOLDER: ["ADMIN"],
  ADMIN: ["STATE_HOLDER"],
  STATE_HOLDER: ["MASTER_DISTRIBUTOR"],
  MASTER_DISTRIBUTOR: ["DISTRIBUTOR"],
  DISTRIBUTOR: ["AGENT"],
  AGENT: [],
};

// ✅ Create User (generic)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, password, pan_number, aadhaar_number } =
    req.body;
  const creatorRole = req.user.role;

  // Check if allowed
  if (!roleHierarchy[creatorRole].includes(role)) {
    return ApiError.send(res, 403, `${creatorRole} cannot create ${role}`);
  }

  // Duplicate check
  const exists = await Prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (exists) {
    return ApiError.send(
      res,
      400,
      `${role} already exists with same email/phone`
    );
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await Prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      pan_number,
      aadhaar_number,
      parent_id: req.user.id,
      isActive: true,
      isAuthorized: true,
      status: "ACTIVE",
    },
  });

  await Prisma.auditLog.create({
    data: {
      user_id: req.user.id,
      action: "USER_CREATED",
      description: `${creatorRole} ${req.user.email} created ${role}: ${email}`,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    },
  });

  const { password: _, ...safeUser } = newUser;
  return res
    .status(201)
    .json(new ApiResponse(201, `${role} created successfully`, safeUser));
});

// ✅ Get all users (filter + pagination)
export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};
  if (role) filters.role = role;
  if (status) filters.status = status;

  const users = await Prisma.user.findMany({
    where: filters,
    skip: Number(skip),
    take: Number(limit),
    orderBy: { createdAt: "desc" },
  });

  const total = await Prisma.user.count({ where: filters });

  return res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  });
});

// ✅ Get single user
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await Prisma.user.findUnique({ where: { id } });
  if (!user) return ApiError.send(res, 404, "User not found");
  const { password, ...safeUser } = user;
  return res.status(200).json(new ApiResponse(200, "User fetched", safeUser));
});

// ✅ Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, status, isActive } = req.body;

  const target = await Prisma.user.findUnique({ where: { id } });
  if (!target) return ApiError.send(res, 404, "User not found");

  if (
    req.user.role !== "SUPER_ADMIN" &&
    req.user.id !== target.parent_id &&
    req.user.id !== id
  ) {
    return ApiError.send(res, 403, "Not allowed to update this user");
  }

  const updatedUser = await Prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(status && { status }),
      ...(isActive !== undefined && { isActive }),
      ...(role && req.user.role === "SUPER_ADMIN" && { role }),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "User updated", updatedUser));
});

// ✅ Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const target = await Prisma.user.findUnique({ where: { id } });
  if (!target) return ApiError.send(res, 404, "User not found");

  if (
    req.user.role !== "SUPER_ADMIN" &&
    req.user.id !== target.parent_id &&
    req.user.id !== id
  ) {
    return ApiError.send(res, 403, "Not allowed to delete this user");
  }

  await Prisma.user.delete({ where: { id } });
  return res.status(200).json(new ApiResponse(200, "User deleted"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) return ApiError.send(res, 403, "Unauthorized access");
  const users = await Prisma.user.findMany({
    where: {
      NOT: {
        role: "ADMIN"
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!users) return ApiError.send(res, 404, "user/members not found.");
  return res
    .status(200)
    .json(new ApiResponse(200, "fetched all memebers/users", users));
});
