import multer from "multer";
import path from "path";
import fs from "fs";
import { randomInt } from "crypto";

const getStorage = (folderName) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `public/uploads/${folderName}`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const year = new Date().getFullYear();
      const pincode = req.body.pinCode || randomInt(4);
      const ext = path.extname(file.originalname);
      let prefix = "";

      switch (file.fieldname) {
        case "aadhaarImageFront":
          prefix = "aadhaar-front";
          break;
        case "aadhaarImageBack":
          prefix = "aadhaar-back";
          break;
        case "panImage":
          prefix = "pan";
          break;
        case "shopAddressImage":
          prefix = "shop-address";
          break;
        case "passbookImage":
          prefix = "passbook";
          break;
        case "paymentImage":
          prefix = "bank-transfer";
          break;
        default:
          prefix = "file";
      }

      cb(null, `${prefix}-${year}-${pincode}${ext}`);
    },
  });

export const kycUpload = multer({ storage: getStorage("kyc") });
export const bankUpload = multer({ storage: getStorage("bank") });
export const walletUpload = multer({ storage: getStorage("walletTopup") });
