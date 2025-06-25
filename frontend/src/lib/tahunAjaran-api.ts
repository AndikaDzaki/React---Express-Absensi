import axios from "axios";
import { tahunFormSchema } from "@/schema/Tahun-Schema";

const API_URL = "http://localhost:8800/api";

export const getTahunAjaran = async () => {
  return axios.get(`${API_URL}/tahunajaran`);
};

export const addTahunAjaran = async (data: tahunFormSchema) => {
  return axios.post(`${API_URL}/tahunajaran`, data);
};

export const updateTahunAjaran = async (id: number, data: tahunFormSchema) => {
  return axios.put(`${API_URL}/tahunajaran/${id}`, data);
};

export const deleteTahunAjaran = async (id: number) => {
  return axios.delete(`${API_URL}/tahunajaran/${id}`);
};
