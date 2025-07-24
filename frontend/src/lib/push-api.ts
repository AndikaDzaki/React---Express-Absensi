import axios from 'axios';

const API_URL = 'http://localhost:8800/api';


export const sendPushNotification = () => {
  return axios.post(`${API_URL}/notify`);
};
