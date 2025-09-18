import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  hashPassword,
  comparePassword,
} from "../utils/lib.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // dev
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

const ALLOWED_ROLES = [
  "STATE_HOLDER",
  "MASTER_DISTRIBUTOR",
  "DISTRIBUTOR",
  "AGENT",
];

const ROLE_HIERARCHY = {
  ADMIN: ["STATE_HOLDER", "MASTER_DISTRIBUTOR", "DISTRIBUTOR", "AGENT"],
  STATE_HOLDER: ["MASTER_DISTRIBUTOR", "DISTRIBUTOR", "AGENT"],
  MASTER_DISTRIBUTOR: ["DISTRIBUTOR", "AGENT"],
  DISTRIBUTOR: ["AGENT"],
};

// -------------------- public Register --------------------
const publicRegister = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { name, email, phone, password, role } = req.body;

  if ([name, email, phone, password, role].some((f) => !f || f.trim() === "")) {
    return ApiError.send(res, 422, "All fields are required");
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return ApiError.send(res, 400, "Invalid role");
  }

  const userExists = await Prisma.user.findFirst({
    where: { OR: [{ phone }, { email }] },
  });
  if (userExists) {
    return ApiError.send(res, 409, "User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const userCreated = await Prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      isAuthorized: false,
      status: "IN_ACTIVE",
    },
  });

  const { password: _, ...userWithoutPassword } = userCreated;

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        `registered as ${role} (waiting for Admin approval)`,
        userWithoutPassword
      )
    );
});

// -------------------- all in one register role base --------------------
const roleBasedRegister = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if ([name, email, phone, password, role].some((f) => !f || f.trim() === "")) {
    return ApiError.send(res, 422, "All fields are required");
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return ApiError.send(res, 400, "Invalid role");
  }

  const creatorRole = req.user?.role;

  if (!creatorRole || !ROLE_HIERARCHY[creatorRole]) {
    return ApiError.send(res, 403, "You are not allowed to create users");
  }

  if (!ROLE_HIERARCHY[creatorRole].includes(role)) {
    return ApiError.send(
      res,
      403,
      `As ${creatorRole}, you can only create: ${ROLE_HIERARCHY[creatorRole].join(", ")}`
    );
  }

  const userExists = await Prisma.user.findFirst({
    where: { OR: [{ phone }, { email }] },
  });
  if (userExists) {
    return ApiError.send(res, 409, "User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const userCreated = await Prisma.user.create({
    data: {
      name,
      email,
      phone,
      parent_id: creatorRole,
      password: hashedPassword,
      role,
      isActive: false,
      isAuthorized: false,
      status: "IN_ACTIVE",
    },
  });

  await Prisma.auditLog.create({
    data: {
      user_id: userCreated.id,
      action: "USER_REGISTER_ROLE_BASED",
      description: `${creatorRole} created ${role}: ${email}`,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    },
  });

  const { password: _, ...userWithoutPassword } = userCreated;

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        `${creatorRole} registered new ${role} (waiting for Admin approval)`,
        userWithoutPassword
      )
    );
});

// -------------------- Role-based User Register --------------------
const createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, parent_id } = req.body;

  if (!role) return ApiError.send(res, 400, "Role is required");

  // check parent exists
  const parent = await Prisma.user.findFirst({ where: { id: parent_id } });
  if (!parent) return ApiError.send(res, 404, "Parent user not found");

  // Role hierarchy check yahan lagayenge (optional: helper function se)
  // Example: DISTRIBUTOR sirf MASTER_DISTRIBUTOR create karega

  const hashedPassword = await hashPassword(password);

  const newUser = await Prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      parent_id,
      isActive: false,
      isAuthorized: false,
      status: "IN_ACTIVE",
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, `${role} created successfully`, newUser));
});

// -------------------- Login --------------------
const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return ApiError.send(res, 400, "Email/Phone and Password are required");
  }

  const user = await Prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    include: { kycDetails: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!user) return ApiError.send(res, 404, "User not found");

  if (!user.isAuthorized === true || user.status !== "ACTIVE") {
    return ApiError.send(
      res,
      403,
      "Your account is not active. Contact Admin/Parent."
    );
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return ApiError.send(res, 401, "Invalid credentials");

  const kyc = user.kycDetails[0];
  let needsKyc = false;

  if (!kyc) {
    needsKyc = true;
  } else if (kyc.kycStatus === "PENDING") {
    return ApiError.send(
      res,
      403,
      "KYC is pending. Please wait for verification."
    );
  } else if (kyc.kycStatus === "REJECTED") {
    return ApiError.send(res, 403, "KYC rejected. Contact Admin to reapply.");
  }

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    needsKyc,
  });

  if (!token) {
    return ApiError.send(res, 500, "Server error generating access token");
  }

  if (user.role === "ADMIN") {
    await Prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        description: `${user.role} logged in: ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });
  }

  const { password: _, ...userWithoutPassword } = user;

  res
    .status(200)
    .cookie("accessToken", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        needsKyc ? "Login success (KYC required)" : "Login success",
        {
          ...userWithoutPassword,
          token,
        }
      )
    );
});

// -------------------- Logout -------------------
const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions);

  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

// -------------------- Single Auth ----------------
const getSingleAuth = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) return ApiError.send(res, 401, "User not authorized");

  const userExists = await Prisma.user.findFirst({ where: { id: userId } });
  if (!userExists) return ApiError.send(res, 404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, "Single user fetched successfully", userExists));
});

export {
  publicRegister,
  roleBasedRegister,
  // superAdminRegister,
  createUser,
  login,
  logout,
  getSingleAuth,
};
