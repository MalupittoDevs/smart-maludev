// frontend/src/lib/api.ts
import axios from "axios";

const RAW_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

// Garantiza que termine en /api exactamente una vez
export const API_BASE =
  RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export type Product = {
  id: number;
  sku: string;
  name: string;
  qty: number;
  status: "AVAILABLE" | "PENDING" | "OUT";
  price: number;            // ← agregado
  updated_at: string;       // ← agregado
};

// Lo que devuelve el endpoint /products/{id}/buy/
export type BuyResponse = {
  message: string;
  new_stock: number;
  status: Product["status"];
};

export const InventoryApi = {
  list: () => api.get<Product[]>("/products/"),
  create: (p: Omit<Product, "id" | "updated_at">) => api.post<Product>("/products/", p),
  remove: (id: number) => api.delete(`/products/${id}/`),
  buy: (id: number, qty: number) =>
    api.post<BuyResponse>(`/products/${id}/buy/`, { qty }),
};
