import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

// -------------------- Add Commission --------------------
const addCommission = asyncHandler(async (req, res) => {
  const adminId = req.user?.id;
  const { role, service, from, to, value, type } = req.body;

  if (!adminId) return ApiError.send(res, 401, "Unauthorized");

  const adminExist = await Prisma.user.findFirst({ where: { id: adminId } });
  if (!adminExist) return ApiError.send(res, 401, "User not found");

  if (
    !role ||
    !service ||
    from == null ||
    to == null ||
    value == null ||
    !type
  ) {
    return ApiError.send(
      res,
      400,
      "role, service, from, to, value and type are required"
    );
  }

  const fromNum = Number(from);
  const toNum = Number(to);
  const valueNum = Number(value);

  if (Number.isNaN(fromNum) || Number.isNaN(toNum) || Number.isNaN(valueNum)) {
    return ApiError.send(res, 400, "from, to and value must be numbers");
  }

  // ✅ Ensure unique slab per admin
  const existing = await Prisma.commission.findFirst({
    where: {
      role,
      service,
      from: fromNum,
      to: toNum,
      adminId,
    },
  });

  if (existing) {
    return ApiError.send(
      res,
      400,
      "A commission slab with same role/service/from/to already exists"
    );
  }

  const commission = await Prisma.commission.create({
    data: {
      adminId,
      role,
      service,
      from: fromNum,
      to: toNum,
      value: valueNum,
      type,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Commission slab added successfully", commission)
    );
});

// -------------------- Get Commission for a User --------------------
const getCommissions = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await Prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, parentId: true },
  });

  if (!user) return ApiError.send(res, 404, "User not found");

  let where = {};

  if (user.role === "ADMIN") {
    // ✅ Agar admin hai → apne hi banaye commissions dikhaye
    where = { adminId: user.id };
  } else {
    // ✅ Agar child user hai → uske parent admin ke commissions dikhaye
    where = {
      role: user.role,
      adminId: user.parentId,
    };
  }

  const commissions = await Prisma.commission.findMany({
    where,
    orderBy: { from: "asc" },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "User commission slabs fetched", commissions));
});

// -------------------- Update Commission Slab --------------------
const updateCommission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { from, to, value, type, role, service } = req.body;

  // Check at least one field provided
  if (
    from == null &&
    to == null &&
    value == null &&
    !type &&
    !role &&
    !service
  ) {
    return ApiError.send(res, 400, "At least one field is required to update");
  }

  const toUpdate = {};

  // Number fields validation
  if (from != null) {
    if (isNaN(Number(from)))
      return ApiError.send(res, 400, "From must be a valid number");
    toUpdate.from = Number(from);
  }

  if (to != null) {
    if (isNaN(Number(to)))
      return ApiError.send(res, 400, "To must be a valid number");
    toUpdate.to = Number(to);
  }

  if (value != null) {
    if (isNaN(Number(value)))
      return ApiError.send(res, 400, "Value must be a valid number");
    toUpdate.value = Number(value);
  }

  if (type) {
    const validTypes = ["FIXED", "PERCENT"];
    if (!validTypes.includes(type)) {
      return ApiError.send(res, 400, "Invalid type. Allowed: FIXED, PERCENT");
    }
    toUpdate.type = type;
  }

  if (role) {
    const validRoles = [
      "STATE_HOLDER",
      "MASTER_DISTRIBUTOR",
      "DISTRIBUTOR",
      "AGENT",
    ];
    if (!validRoles.includes(role)) {
      return ApiError.send(
        res,
        400,
        "Invalid role. Allowed: STATE_HOLDER, MASTER_DISTRIBUTOR, DISTRIBUTOR, AGENT"
      );
    }
    toUpdate.role = role;
  }

  if (service) {
    const validServices = ["NEFT", "IMPS"];
    if (!validServices.includes(service)) {
      return ApiError.send(res, 400, "Invalid service. Allowed: NEFT, IMPS");
    }
    toUpdate.service = service;
  }

  // Update in DB
  const updated = await Prisma.commission.update({
    where: { id },
    data: toUpdate,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Commission slab updated", updated));
});

// -------------------- Delete Commission Slab --------------------
const deleteCommission = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log(userId);

  const userRole = req.user.role;

  if (!userId) {
    return ApiError.send(res, 400, "Commission ID is required");
  }

  const commission = await Prisma.commission.findUnique({
    where: { id: userId },
  });

  if (!commission) {
    return ApiError.send(res, 404, "Commission slab not found");
  }

  if (commission.role === "ADMIN" || commission.role === "ADMINFIND") {
    return ApiError.send(res, 403, "Cannot delete admin commission slabs");
  }

  if (userRole !== "ADMIN") {
    return ApiError.send(res, 403, "Only admin can delete commission slabs");
  }

  await Prisma.commission.delete({ where: { id: userId } });

  res
    .status(200)
    .json(new ApiResponse(200, "Commission slab deleted", { userId }));
});

export { addCommission, getCommissions, updateCommission, deleteCommission };
