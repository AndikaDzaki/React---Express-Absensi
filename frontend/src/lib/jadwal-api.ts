import axios from "axios";
import { JadwalForm } from "@/schema/jadwalAdmin";

const API_URL = "http://localhost:8800/api";

export const getJadwal = () => axios.get(`${API_URL}/jadwal`);

export const addJadwal = (data: JadwalForm) => axios.post(`${API_URL}/jadwal`, data);

export const updateJadwal = (id: number, data: JadwalForm) => axios.put(`${API_URL}/jadwal/${id}`, data);

export const deleteJadwal = (id: number) => axios.delete(`${API_URL}/jadwal/${id}`);

export const generateJadwal = () => axios.get(`${API_URL}/jadwal/generate-harian`);

export const getJadwalHariIni = () => axios.get(`${API_URL}/hari-ini`, { withCredentials: true });
