import axios from "axios";
import { API_BASE_URL } from "./store/constants";

const API_TIMEOUT = 15000;
export const API_URL = API_BASE_URL

export const instance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
});

export const userInstance = axios.create({
  baseURL: `${API_URL}/admin/users`,
  timeout: API_TIMEOUT,
});