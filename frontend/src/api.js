import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true // required for cookies
});

let accessToken = null;
let csrfToken = null;

// ================= SET ACCESS TOKEN =================
export const setAccessToken = (token) => {
  accessToken = token;
};

// ================= INITIALIZE CSRF =================
export const initializeCsrf = async () => {
  if (!csrfToken) {
    const res = await api.get("/auth/csrf-token");
    csrfToken = res.data.csrfToken;
  }
};

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (
    csrfToken &&
    ["post", "put", "delete", "patch"].includes(config.method)
  ) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await api.post("/auth/refresh");
        setAccessToken(res.data.accessToken);

        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(error.config);
      } catch {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403) {
      alert("Security validation failed. Please refresh page.");
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default api;