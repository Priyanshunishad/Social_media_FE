import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Vite env variable
  withCredentials: true, // for cookie-based auth
});