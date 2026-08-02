import axios from "axios";

import {
  AUTH_SESSION_EXPIRED_EVENT,
  notifySessionExpired,
} from "./authEvents";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5284";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const expectedUnauthorizedPaths = [
  "/api/auth/login",
  "/api/auth/setup",
  "/api/auth/me",
];

api.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const statusCode =
      error.response?.status;

    const requestUrl =
      error.config?.url ?? "";

    const isExpectedUnauthorizedRequest =
      expectedUnauthorizedPaths.some(
        (path) => requestUrl.includes(path)
      );

    if (
      statusCode === 401 &&
      !isExpectedUnauthorizedRequest &&
      typeof window !== "undefined"
    ) {
      notifySessionExpired();
    }

    return Promise.reject(error);
  }
);

export {
  AUTH_SESSION_EXPIRED_EVENT,
};