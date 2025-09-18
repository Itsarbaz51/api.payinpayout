import Prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// -------------------- Create KYC --------------------
export const createKyc = asyncHandler(async (req, res) => {
  const {
    panNumber,
    aadhaarNumber,
    fatherName,
    dob,
    homeAddress,
    shopName,
    district,
    shopAddress,
    pinCode,
    state,
  } = req.body;

  if (
    !panNumber ||
    !aadhaarNumber ||
    !fatherName ||
    !dob ||
    !homeAddress ||
    !shopName ||
    !district ||
    !pinCode ||
    !shopAddress ||
    !state
  ) {
    return ApiError.send(res, 422, "All fields are required");
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    return ApiError.send(res, 400, "Invalid PAN number format (ABCDE1234F)");
  }

  if (!/^[0-9]{12}$/.test(aadhaarNumber)) {
    return ApiError.send(res, 400, "Invalid Aadhaar number format (12 digits)");
  }

  const existingUserKyc = await Prisma.kycDetail.findFirst({
    where: { userId: req.user.id },
  });
  if (existingUserKyc) {
    return ApiError.send(
      res,
      409,
      "KYC already submitted. Please wait for verification."
    );
  }

  const existingKyc = await Prisma.kycDetail.findFirst({
    where: { OR: [{ panNumber }, { aadhaarNumber }] },
  });
  if (existingKyc) {
    return ApiError.send(res, 409, "PAN or Aadhaar already exists");
  }

  const panImagePath = req.files?.panImage?.[0]?.path;
  const aadhaarFrontPath = req.files?.aadhaarImageFront?.[0]?.path;
  const aadhaarBackPath = req.files?.aadhaarImageBack?.[0]?.path;
  const shopAddressPath = req.files?.shopAddressImage?.[0]?.path;

  if (
    !panImagePath ||
    !aadhaarFrontPath ||
    !aadhaarBackPath ||
    !shopAddressPath
  ) {
    return ApiError.send(res, 422, "All image files are required");
  }

  // Store in DB
  const kyc = await Prisma.kycDetail.create({
    data: {
      panNumber,
      aadhaarNumber,
      panImage: panImagePath,
      aadhaarImageFront: aadhaarFrontPath,
      aadhaarImageBack: aadhaarBackPath,
      shopAddressImage: shopAddressPath,
      fatherName,
      dob,
      homeAddress,
      shopName,
      district,
      pinCode,
      state,
      shopAddress,
      userId: req.user.id,
    },
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "KYC submitted successfully (Pending verification)",
        kyc
      )
    );
});

// -------------------- KYC verified by admin --------------------
export const verifyKyc = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(status);
  console.log(id);

  if (!status) {
    return ApiError.send(res, 400, "Status is required");
  }
  const normalizedStatus = status.toUpperCase();

  const validStatuses = ["VERIFIED", "REJECTED"];

  if (!validStatuses.includes(normalizedStatus)) {
    return ApiError.send(
      res,
      400,
      "Invalid status, must be VERIFIED or REJECTED"
    );
  }

  const kyc = await Prisma.kycDetail.findUnique({ where: { id } });
  if (!kyc) return ApiError.send(res, 404, "KYC record not found");

  const updatedKyc = await Prisma.kycDetail.update({
    where: { id: kyc.id },
    data: { kycStatus: normalizedStatus },
  });

  if (normalizedStatus === "VERIFIED") {
    await Prisma.user.update({
      where: { id: kyc.userId },
      data: { isAuthorized: true, status: "ACTIVE", isKyc: true },
    });
  } else if (normalizedStatus === "REJECTED") {
    await Prisma.user.update({
      where: { id: kyc.userId },
      data: { isAuthorized: false, status: "IN_ACTIVE", isKyc: false },
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, `KYC ${normalizedStatus} successfully`, updatedKyc)
    );
});

// -------------------- KYC get all --------------------
export const getAllKyc = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    return ApiError.send(res, 403, "Unauthorized Access");
  }

  let kycdata;

  if (["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    kycdata = await Prisma.kycDetail.findMany({
      include: { User: true },
    });
  } else {
    kycdata = await Prisma.kycDetail.findMany({
      where: { userId },
      include: { User: true },
    });

    kycdata = kycdata.map((kyc) => ({
      ...kyc,
      panNumber:
        kyc.panNumber.length > 4
          ? kyc.panNumber.replace(/.(?=.{4})/g, "*")
          : kyc.panNumber,
      aadhaarNumber:
        kyc.aadhaarNumber.length > 4
          ? kyc.aadhaarNumber.replace(/.(?=.{4})/g, "*")
          : kyc.aadhaarNumber,
    }));
  }

  if (!kycdata || kycdata.length === 0) {
    return ApiError.send(res, 404, "KYC not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "KYC fetched successfully", kycdata));
});
