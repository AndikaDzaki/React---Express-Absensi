import axios from "axios";
import { SemesterForm } from "@/schema/semester-schema";

const API_URL = "http://localhost:8800/api";

export interface SemesterItem extends SemesterForm {
  id: number;
  status: "Aktif" | "Tidak Aktif";
  tahun_ajaran: string;
}

export const getSemester = () => axios.get<SemesterItem[]>(`${API_URL}/semester`);

export const addSemester = (data: SemesterForm) => axios.post(`${API_URL}/semester`, data);

export const updateSemester = (id: number, data: SemesterForm) =>
  axios.put(`${API_URL}/semester/${id}`, data);

export const deleteSemester = (id: number) => axios.delete(`${API_URL}/semester/${id}`);
