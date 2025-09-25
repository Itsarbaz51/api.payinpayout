import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { checkUserAuth, hashPassword } from "../utils/lib.js";

// ================ Create user by SUPER_ADMIN ================
export const createUser = asyncHandler(async (req, res) => {
  const userExists = await checkUserAuth(req, res, req.user.role);
  if (!userExists) return;

  const { name, email, phone, role, password } = req.body;

  if (!name || !email || !phone || !role || !password) {
    return ApiError.send(res, 403, "All fields are required");
  }

  const roleHierarchy = {
    ADMIN: ["STATE_HEAD", "MASTER_DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"],
    STATE_HEAD: ["MASTER_DISTRIBUTOR", "DISTRIBUTOR", "RETAILER"],
    MASTER_DISTRIBUTOR: ["DISTRIBUTOR", "RETAILER"],
    DISTRIBUTOR: ["RETAILER"],
    RETAILER: [],
  };

  const creatorRole = userExists.role;
  const allowedRoles = roleHierarchy[creatorRole] || [];

  if (!allowedRoles.includes(role)) {
    return ApiError.send(
      res,
      403,
      `${creatorRole} is not allowed to create ${role}`
    );
  }

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
  const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = await Prisma.user.create({
    data: {
      name,
      email,
      phone,
      parentId: userExists.id,
      pin: pinCode,
      password: hashedPassword,
      role,
      isAuthorized: true,
      status: "IN_ACTIVE",
    },
  });

  if (!newUser) {
    return ApiError.send(res, 500, `${role} not created | Server Error`);
  }

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

  const roleHierarchy = {
    SUPER_ADMIN: "ADMIN",
    ADMIN: "STATE_HOLDER",
    STATE_HOLDER: "MASTER_DISTRIBUTOR",
    MASTER_DISTRIBUTOR: "DISTRIBUTOR",
    DISTRIBUTOR: "RETAILER",
    RETAILER: null,
  };

  let users = [];
  const allowedRole = roleHierarchy[user.role];

  if (!allowedRole) {
    // AGENT or last role → apne neeche wale (parentId / subParentId se linked)
    users = await Prisma.user.findMany({
      where: {
        OR: [{ parentId: user.id }, { subParentId: user.id }],
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Sirf ek level neeche wala role
    users = await Prisma.user.findMany({
      where: {
        parentId: user.id,
        role: allowedRole,
      },
      orderBy: { createdAt: "desc" },
    });
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
