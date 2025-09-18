import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { hashPassword } from "../utils/lib.js";

// Role hierarchy map
const roleHierarchy = {
  SUPER_ADMIN: ["API_HOLDER", "ADMIN"],
  API_HOLDER: ["ADMIN"],
  ADMIN: ["STATE_HOLDER"],
  STATE_HOLDER: ["MASTER_DISTRIBUTOR"],
  MASTER_DISTRIBUTOR: ["DISTRIBUTOR"],
  DISTRIBUTOR: ["AGENT"],
  AGENT: [],
};

// Create User (generic)
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

// Get all users (filter + pagination)
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

// get user by id
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requesterRole = req.user.role;

  if (!id) {
    return ApiError.send(res, 400, "User ID is required");
  }

  const user = await Prisma.user.findUnique({
    where: { id },
    include: {
      bankDetails: true,
      kycDetails: true,
    },
  });

  if (!user) {
    return ApiError.send(res, 404, "User not found");
  }

  const { password, bankDetails, kycDetails, ...safeUser } = user;

  let safeBank = null;
  if (bankDetails) {
    safeBank = {
      id: bankDetails.id,
      accountHolder: bankDetails.accountHolder,
      bankName: bankDetails.bankName,
      ifscCode: bankDetails.ifscCode,
      isVerified: bankDetails.isVerified,
      accountNumber:
        requesterRole === "ADMIN" || requesterRole === "SUPER_ADMIN"
          ? bankDetails.accountNumber
          : `XXXXXX${bankDetails.accountNumber.slice(-4)}`,
    };
  }

  let safeKyc = null;
  if (kycDetails) {
    safeKyc = {
      id: kycDetails.id,
      panImage: kycDetails.panImage,
      aadhaarImageFront: kycDetails.aadhaarImageFront,
      aadhaarImageBack: kycDetails.aadhaarImageBack,
      fatherName: kycDetails.fatherName,
      dob: kycDetails.dob,
      homeAddress: kycDetails.homeAddress,
      shopName: kycDetails.shopName,
      shopAddress: kycDetails.shopAddress,
      district: kycDetails.district,
      state: kycDetails.state,
      pinCode: kycDetails.pinCode,
      kycStatus: kycDetails.kycStatus,
      createdAt: kycDetails.createdAt,
      updatedAt: kycDetails.updatedAt,

      panNumber:
        requesterRole === "ADMIN" || requesterRole === "SUPER_ADMIN"
          ? kycDetails.panNumber
          : `XXXXX${kycDetails.panNumber.slice(-4)}`,
      aadhaarNumber:
        requesterRole === "ADMIN" || requesterRole === "SUPER_ADMIN"
          ? kycDetails.aadhaarNumber
          : `XXXX XXXX ${kycDetails.aadhaarNumber.slice(-4)}`,
    };
  }

  return res.status(200).json(
    new ApiResponse(200, "User fetched successfully", {
      ...safeUser,
      bankDetails: safeBank,
      kycDetails: safeKyc,
    })
  );
});

// Update user
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

// Delete user
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
  const user = req.user;

  if (!user?.id || !user?.role) {
    return ApiError.send(res, 403, "Unauthorized access");
  }

  let users = [];

  switch (user.role) {
    case "SUPER_ADMIN":
      users = await Prisma.user.findMany({
        where: { NOT: { role: "SUPER_ADMIN" } },
        orderBy: { createdAt: "desc" },
      });
      break;

    case "API_HOLDER":
      users = await Prisma.user.findMany({
        where: { parentId: user.id },
        orderBy: { createdAt: "desc" },
      });
      break;

    case "ADMIN":
      users = await Prisma.user.findMany({
        where: { parentId: user.id },
        orderBy: { createdAt: "desc" },
      });
      break;

    case "STATE_HOLDER":
      users = await Prisma.user.findMany({
        where: { parentId: user.id },
        orderBy: { createdAt: "desc" },
      });
      break;

    case "MASTER_DISTRIBUTOR":
      users = await Prisma.user.findMany({
        where: { parentId: user.id },
        orderBy: { createdAt: "desc" },
      });
      break;

    case "DISTRIBUTOR":
      users = await Prisma.user.findMany({
        where: { parentId: user.id },
        orderBy: { createdAt: "desc" },
      });
      break;

    case "AGENT":
      users = await Prisma.user.findMany({
        where: { id: user.id }, // sirf apna khud ka
        orderBy: { createdAt: "desc" },
      });
      break;

    default:
      return ApiError.send(res, 403, "You are not allowed to view users.");
  }

  if (!users || users.length === 0) {
    return ApiError.send(res, 404, "No users found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Fetched all members/users", users));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;
  const { status } = req.body;

  if (!id) return ApiError.send(res, 402, "User ID required");
  if (!status) return ApiError.send(res, 402, "Status required");

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return ApiError.send(res, 403, "Only admin can change status");
  }

  const user = await Prisma.user.findUnique({ where: { id } });
  if (!user) return ApiError.send(res, 404, "User not found");

  const updatedUser = await Prisma.user.update({
    where: { id },
    data: { status, isAuthorized: true },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, `User status updated to ${status}`, updatedUser)
    );
});
