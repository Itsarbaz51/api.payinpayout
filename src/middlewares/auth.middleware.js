import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import Prisma from "../db/db.js";
import asyncHandler from "../utils/asyncHandler.js";

// Auth check
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  console.log(req.cookies);
  console.log(req.headers);

  const token =
    req.cookies?.accessToken ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    return ApiError.send(res, 401, "Unauthorized: No token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return ApiError.send(res, 401, "Unauthorized: Invalid/Expired token");
  }

  const user = await Prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    return ApiError.send(res, 401, "Unauthorized: Invalid token user");
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  next();
});

// Role-based access check
export const authorizeRoles = (allowedRoles = []) =>
  asyncHandler(async (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return ApiError.send(res, 401, "Unauthorized: No role found");
    }

    if (!allowedRoles.includes(userRole)) {
      return ApiError.send(res, 403, "Forbidden: Insufficient privileges");
    }

    next();
  });
