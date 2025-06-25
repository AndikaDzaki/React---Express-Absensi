import prisma from "../config/prisma.js";
import { absensiSchema } from "../validations/absensiValidations.js";
import { generateAbsensiHarianService } from "../services/absensiService.js";
import jwt from "jsonwebtoken";
import { io } from "../main.js";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_token";

export const scanAbsensi = async (req, res) => {
  const { token } = req.body;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const idSiswa = payload.id_siswa;

    const qrCode = await prisma.qr_codes.findUnique({
      where: { id_siswa: idSiswa },
    });

    if (!qrCode || qrCode.kode_qr !== token) {
      return res.status(401).json({ message: "Token tidak cocok dengan QR yang tersimpan" });
    }

    const siswa = await prisma.siswa.findUnique({
      where: { id: idSiswa },
      include: { kelas: true },
    });

    if (!siswa) {
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    wib.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.absensi.findFirst({
      where: {
        id_siswa: siswa.id,
        tanggal: wib,
      },
    });

    if (existing && existing.status === "Hadir") {
      return res.status(200).json({ message: "Sudah absen hari ini", siswa });
    }

    if (existing) {
      await prisma.absensi.update({
        where: { id: existing.id },
        data: { status: "Hadir" },
      });
    } else {
      await prisma.absensi.create({
        data: {
          id_siswa: siswa.id,
          kelas_id: siswa.id_kelas,
          tanggal: wib,
          status: "Hadir",
        },
      });
    }

    io.emit("absensi-updated", {
      id_siswa: siswa.id,
      nama: siswa.nama,
      kelas: siswa.kelas.nama_kelas,
      status: "Hadir",
      tanggal: wib,
    });

    res.json({
      message: "Absensi berhasil",
      siswa: {
        nama: siswa.nama,
        nisn: siswa.nisn,
        kelas: siswa.kelas.nama_kelas,
      },
    });
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token tidak valid" });
    }
    res.status(500).json({ message: "Terjadi kesalahan saat proses absensi" });
  }
};

export const getAllAbsensi = async (req, res) => {
  try {
    const data = await prisma.absensi.findMany({
      select: {
        id: true,
        id_siswa: true,
        kelas_id: true,
        tanggal: true,
        status: true,
      },
    });

    const formatted = data.map((item) => ({
      ...item,
      tanggal: item.tanggal.toISOString().split("T")[0],
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

export const addAbsensi = async (req, res) => {
  const validation = absensiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ Error: validation.error.errors });
  }

  const { id_siswa, kelas_id, tanggal, status } = validation.data;

  try {
    const created = await prisma.absensi.create({
      data: {
        id_siswa,
        kelas_id,
        tanggal: new Date(tanggal),
        status,
      },
    });

    res.status(201).json({
      message: "Absensi ditambahkan",
      id: created.id,
    });

  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

export const updateAbsensi = async (req, res) => {
  const { id } = req.params;
  const validation = absensiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ Error: validation.error.errors });
  }

  const { id_siswa, kelas_id, tanggal, status } = validation.data;

  try {
    await prisma.absensi.update({
      where: { id: Number(id) },
      data: {
        id_siswa,
        kelas_id,
        tanggal: new Date(tanggal),
        status,
      },
    });

    res.status(200).json({ message: "Data absensi diperbarui" });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

export const deleteAbsensi = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.absensi.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Data absensi dihapus" });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

export const generateAbsensiHarian = async (req, res) => {
  try {
    const result = await generateAbsensiHarianService();
    if (result.skip) {
      return res.status(200).json({ message: result.message });
    }
    res.status(200).json({ message: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAbsensiByKelas = async (req, res) => {
  const { kelasId } = req.params;
  const tanggalParam = req.query.tanggal || new Date().toISOString().split("T")[0];
  const idGuru = req.user.id;

  try {
    const tanggal = new Date(tanggalParam);

    const kelas = await prisma.kelas.findFirst({
      where: {
        id: Number(kelasId),
        id_guru: idGuru,
      },
    });

    if (!kelas) {
      return res.status(403).json({ message: "Anda tidak memiliki akses ke kelas ini" });
    }

    const absensi = await prisma.absensi.findMany({
      where: {
        kelas_id: Number(kelasId),
        tanggal,
      },
      include: {
        siswa: true,
      },
    });

    res.json(absensi);
  } catch (error) {
    console.error("Gagal mengambil absensi berdasarkan kelas:", error);
    res.status(500).json({ error: "Gagal mengambil data absensi" });
  }
};

export const updateBanyakAbsensi = async (req, res) => {
  const absensiArray = req.body;


  if (!Array.isArray(absensiArray) || absensiArray.length === 0) {
    return res.status(400).json({ message: "Data absensi kosong atau bukan array" });
  }

  try {
    for (const item of absensiArray) {
      if (
        typeof item.id_siswa !== "number" ||
        !item.tanggal ||
        typeof item.status !== "string"
      ) {
        return res.status(400).json({
          message: "Data absensi tidak valid",
          item,
        });
      }
    }

    const updatePromises = absensiArray.map((item) =>
      prisma.absensi.updateMany({
        where: {
          id_siswa: item.id_siswa,
          tanggal: new Date(item.tanggal),
        },
        data: {
          status: item.status,
        },
      })
    );

    await Promise.all(updatePromises);

    io.emit("absensi-batch-updated", absensiArray);

    res.json({ message: "Absensi berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal update absensi:", error);
    res.status(500).json({
      error: "Gagal update absensi",
      detail: error.message,
      stack: error.stack,
    });
  }
};
