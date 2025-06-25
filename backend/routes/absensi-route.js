import express from "express";
import { getAllAbsensi, addAbsensi, deleteAbsensi, updateAbsensi, generateAbsensiHarian, scanAbsensi,getAbsensiByKelas,updateBanyakAbsensi } from "../controller/absensi.js";
import { verifyGuru } from "../middleware/verifyGuru.js";

const router = express.Router();

router.get("/absensi", getAllAbsensi);
router.post("/absensi", addAbsensi);
router.delete("/absensi/:id", deleteAbsensi);
router.put("/absensi/:id", updateAbsensi);
router.get("/absensi/generate-harian", generateAbsensiHarian);
router.get("/absensi/kelas/:kelasId", verifyGuru, getAbsensiByKelas);
router.post("/absensi/scan", scanAbsensi)
router.patch("/absensi", updateBanyakAbsensi);

export default router;
