import axios from "axios";

const PRODUCT_API_URL = import.meta.env.VITE_RETAIL_POS_PRODUCT_API_URL;

const productManagementApi = axios.create({
  baseURL: PRODUCT_API_URL,
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