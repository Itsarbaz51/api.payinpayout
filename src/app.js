import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const data = "50mb";

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = ["http://localhost:5173"];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: data }));
app.use(express.urlencoded({ extended: true, limit: data }));
app.use(cookieParser());

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import commissionRoutes from "./routes/commission.routes.js";
import payinRoutes from "./routes/payin.routes.js";
import payoutRoutes from "./routes/payout.routes.js";
import reportRoutes from "./routes/report.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import bankRoutes from "./routes/bank.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/bank", bankRoutes);
app.use("/users", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/commission", commissionRoutes);
app.use("/payin", payinRoutes);
app.use("/payout", payoutRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Hello from root!");
});

export default app;
