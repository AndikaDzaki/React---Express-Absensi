import axios from "axios";
import { absensiForm } from "@/schema/absensi-admin";

const API_URL = "http://localhost:8800/api";

export interface AbsensiItem extends absensiForm {
  id: number;
  nama_siswa?: string;
  nama_kelas?: string;
  siswa?: {
    id: number;
    nama: string;
    id_kelas: number;
  };
}

export const getAbsensi = () => axios.get<AbsensiItem[]>(`${API_URL}/absensi`);

export const getAbsensiByKelas = (kelasId: number) =>
  axios.get<AbsensiItem[]>(`${API_URL}/absensi/kelas/${kelasId}`, {
    withCredentials: true,
  });

export const addAbsensi = (data: absensiForm) => axios.post(`${API_URL}/absensi`, data);

export const updateAbsensi = (id: number, data: absensiForm) => axios.put(`${API_URL}/absensi/${id}`, data);

export const deleteAbsensi = (id: number) => axios.delete(`${API_URL}/absensi/${id}`);

export const generateAbsensiHarian = () => axios.get(`${API_URL}/absensi/generate-harian`);

export const updateAbsensiBatch = (data: { id_siswa: number; tanggal: string; status: string }[]) => axios.patch(`${API_URL}/absensi`, data);

export const scanAbsensi = (token: string) => {
  return axios.post("http://localhost:8800/api/absensi/scan", { token });
};
