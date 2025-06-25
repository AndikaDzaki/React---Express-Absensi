import jwt from "jsonwebtoken";

export const verifyGuru = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan di cookie" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "rahasia_token", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid" });
    }

    if (user.role !== "user") {
      return res.status(403).json({ message: "Akses hanya untuk guru" });
    }

    req.user = user;
    next();
  });
};
