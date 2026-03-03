import axios from "axios";

// Helper to get token/user strictly from sessionStorage for per-tab isolation
const getFromStorage = (key) => {
  return sessionStorage.getItem(key);
};

// Helper to set token/user to sessionStorage for per-tab isolation
export const saveAuthToSession = (token, user) => {
  if (token) sessionStorage.setItem("token", token);
  if (user) {
    sessionStorage.setItem(
      "user",
      typeof user === "string" ? user : JSON.stringify(user)
    );
  }
  // Clear any legacy localStorage values if they exist
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {}
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Build absolute URL for static uploads served by backend
export const getUploadsBaseUrl = () => {
  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  // If apiBase ends with /api, strip it to get server origin
  return apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
};

export const toAbsoluteUploadUrl = (maybeRelativePath) => {
  if (!maybeRelativePath) return "";
  if (/^https?:\/\//i.test(maybeRelativePath)) return maybeRelativePath;
  const base = getUploadsBaseUrl();
  // ensure single slash join
  return `${base}${
    maybeRelativePath.startsWith("/") ? "" : "/"
  }${maybeRelativePath}`;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getFromStorage("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
};

// News API calls
export const newsAPI = {
  // Public news (no auth required)
  getPublic: (params = {}) => api.get("/news/public", { params }),

  // Admin only - get all news
  getAll: (params = {}) => api.get("/news", { params }),

  // User's own news only
  getMy: (params = {}) => api.get("/news/my", { params }),

  // Single news item
  getById: (id) => api.get(`/news/${id}`),

  // Create news
  create: (newsData) => api.post("/news", newsData),

  // Update news
  update: (id, newsData) => api.put(`/news/${id}`, newsData),

  // Delete news
  delete: (id) => api.delete(`/news/${id}`),

  // Search public news
  search: (query, params = {}) =>
    api.get("/news/search", {
      params: { q: query, ...params },
    }),

  // Search user's own news
  searchMy: (query, params = {}) =>
    api.get("/news/my/search", {
      params: { q: query, ...params },
    }),
};

// Upload API calls
export const uploadAPI = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    return api.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;
