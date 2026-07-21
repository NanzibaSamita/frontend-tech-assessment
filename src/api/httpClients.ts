import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  throw new Error("VITE_API_BASE_URL is missing. Add it to your .env file.");
}

const commonConfig = {
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
};


export const publicClient = axios.create(commonConfig);

export const apiClient = axios.create(commonConfig);
