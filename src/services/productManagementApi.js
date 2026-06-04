import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const PRODUCT_API_URL =
  import.meta.env.VITE_RETAIL_POS_PRODUCT_API_URL || `${API_ROOT}/products`;

const productManagementApi = axios.create({
  baseURL: PRODUCT_API_URL,
});

productManagementApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllProducts = () => {
  return productManagementApi.get("/");
};

export const getProductById = (id) => {
  return productManagementApi.get(`/${id}`);
};

export const addProduct = (formData) => {
  return productManagementApi.post("/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProduct = (id, formData) => {
  return productManagementApi.put(`/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deactivateProduct = (id) => {
  return productManagementApi.patch(`/${id}/deactivate`);
};

export const reactivateProduct = (id) => {
  return productManagementApi.patch(`/${id}/reactivate`);
};

export const deleteProduct = (id) => {
  return productManagementApi.delete(`/${id}`);
};

export const getProductByBarcode = (barcode) => {
  return productManagementApi.get(`/barcode/${barcode}`);
};

export const searchProducts = (params) => {
  return productManagementApi.get("/search/filter", { params });
};

export const getActiveProducts = () => {
  return productManagementApi.get("/status/active");
};

export const getInactiveProducts = () => {
  return productManagementApi.get("/status/inactive");
};