import axios from "axios";
import { KelasFormData } from "@/schema/kelas-schema";

const API_URL = "http://localhost:8800/api";

export const getKelas = () => axios.get(`${API_URL}/kelas`);

export const addKelas = (data: KelasFormData) => axios.post(`${API_URL}/kelas`, data);

export const updateKelas = (id: number, data: KelasFormData) => axios.put(`${API_URL}/kelas/${id}`, data);

export const deleteKelas = (id: number) => axios.delete(`${API_URL}/kelas/${id}`);


export const getKelasByGuru = (idGuru: number) =>
  axios.get(`${API_URL}/kelas-by-guru?id=${idGuru}`, {
    withCredentials: true,
  });

