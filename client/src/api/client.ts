import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // sends the httpOnly JWT cookie
});
