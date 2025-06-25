import axios from "axios";
import { SiswaForm } from "@/schema/Siswa-Schema";

const API_URL = "http://localhost:8800/api";

export interface SiswaItem extends SiswaForm {
  id: number;
  nama_kelas?: string;
}

// Ambil semua data siswa
export const getSiswa = () => axios.get<SiswaItem[]>(`${API_URL}/siswa`);

// Tambah siswa
export const addSiswa = (data: SiswaForm) => axios.post(`${API_URL}/siswa`, data);

// Update siswa
export const updateSiswa = (id: number, data: SiswaForm) => axios.put(`${API_URL}/siswa/${id}`, data);

// Hapus siswa
export const deleteSiswa = (id: number) => axios.delete(`${API_URL}/siswa/${id}`);
