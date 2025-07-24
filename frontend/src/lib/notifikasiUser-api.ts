import axios from "axios";
import { notifikasiUserSchema, NotifikasiUser } from "@/schema/notifikasi-user-schema";
import { z } from "zod";

const API_URL = "http://localhost:8800/api";


export const getNotifikasiUser = async (guruId: number): Promise<NotifikasiUser[]> => {
  try {
    const response = await axios.get(`${API_URL}/notifikasi-user/${guruId}`, {
      withCredentials: true,
    });

    const result = z.array(notifikasiUserSchema).safeParse(response.data);
    if (!result.success) {
      console.error("❌ Validasi data notifikasi user gagal:", result.error.format());
      return [];
    }

    return result.data;
  } catch (err) {
    console.error("❌ Gagal fetch notifikasi user:", err);
    throw new Error("Gagal fetch notifikasi user");
  }
};

// Tandai satu notifikasi sebagai dibaca
export const tandaiNotifikasiUser = async (id: number): Promise<void> => {
  try {
    await axios.post(`${API_URL}/notifikasi-user/${id}/dibaca`, null, {
      withCredentials: true,
    });
  } catch (err) {
    console.error(`❌ Gagal menandai notifikasi ${id} sebagai dibaca:`, err);
    throw new Error("Gagal tandai notifikasi");
  }
};

// Hapus satu notifikasi
export const hapusNotifikasiUser = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/notifikasi-user/${id}`, {
      withCredentials: true,
    });
  } catch (err) {
    console.error(`❌ Gagal menghapus notifikasi ${id}:`, err);
    throw new Error("Gagal hapus notifikasi");
  }
};
