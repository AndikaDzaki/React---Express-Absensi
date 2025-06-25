import axios from "axios";

const API_URL = "http://localhost:8800/api"; 

export const getQrToken = (id: number) =>
  axios.get<{ token: string }>(`${API_URL}/qr-token/${id}`)