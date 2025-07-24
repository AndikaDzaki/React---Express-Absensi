import axios from "axios";
import { z } from "zod";
import { NotifikasiForm, notifikasiSchema } from "@/schema/notifikasi-admin";

const API_URL = "http://localhost:8800/api";

export interface NotifikasiItem extends NotifikasiForm {
  id: number;
}

export const getNotifikasiAdmin = async (): Promise<NotifikasiItem[]> => {
  const response = await axios.get(`${API_URL}/notifikasi`);

  const result = z.array(notifikasiSchema).safeParse(response.data);
  if (!result.success) {
    console.error("Validasi data notifikasi gagal:", result.error.format());
    return [];
  }

  return result.data as NotifikasiItem[];
};



export const markNotifikasiAsRead = async (id: number) => {
  return axios.put(`${API_URL}/notifikasi/${id}`);
};

export const deleteNotifikasi = async (id: number) => {
  return axios.delete(`${API_URL}/notifikasi/${id}`);
};
