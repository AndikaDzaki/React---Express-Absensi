import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const route = express.Router();

route.get("/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Hanya admin yang dapat mengakses dashboard ini" });
  }

  res.json({
    message: ` ${req.user.name}`,
    role: req.user.role,
  });
});

route.get("/user/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Hanya user yang dapat mengakses halaman ini" });
  }

  res.json({
    message: ` ${req.user.name}`,
    role: req.user.role,
  });
});
export default route;
