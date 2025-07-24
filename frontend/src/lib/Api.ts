import axios from "axios";
import { GuruForm } from "@/schema/guru-schema";

const API_URL = "http://localhost:8800/api";

export const getGuru = () => axios.get(`${API_URL}/guru`);

export const addGuru = (data: GuruForm) => axios.post(`${API_URL}/guru`, data);

export const updateGuru = (id: number, data: GuruForm) => axios.put(`${API_URL}/guru/${id}`, data);

export const deleteGuru = (id: number) => axios.delete(`${API_URL}/guru/${id}`);

export const getGuruProfile = () => {
  const token = localStorage.getItem("token");

  return axios.get(`${API_URL}/guru-profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

