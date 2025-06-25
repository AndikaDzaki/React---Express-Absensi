import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_token";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan di cookie" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.clearCookie("token");
      return res.status(401).json({ message: "Token telah kedaluwarsa" });
    }

    res.status(403).json({ message: "Token tidak valid" });
  }
};