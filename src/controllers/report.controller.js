import Prisma from "../db/db.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /reports/transactions
const getAllTransactions = asyncHandler(async (req, res) => {
  const { type } = req.query; // payin | payout | wallet

  let data = [];
  if (type === "payin") {
    data = await Prisma.payinTransaction.findMany({ include: { user: true } });
  } else if (type === "payout") {
    data = await Prisma.payoutTransaction.findMany({ include: { user: true } });
  } else {
    data = await Prisma.walletTransaction.findMany({ include: { user: true } });
  }

  res.status(200).json(new ApiResponse(200, "Transactions fetched", data));
});

// GET /reports/audit
const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await Prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  res.status(200).json(new ApiResponse(200, "Audit logs fetched", logs));
});

// GET /reports/commissions
const getCommissionReport = asyncHandler(async (req, res) => {
  const reports = await Prisma.commission.findMany({
    include: { user: true },
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Commission reports fetched", reports));
});

export { getAllTransactions, getAuditLogs, getCommissionReport };
