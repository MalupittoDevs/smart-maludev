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
  price: number;
  updated_at: string;
};

// Lo que devuelve el endpoint /products/{id}/buy/
export type BuyResponse = {
  message: string;
  new_stock: number;
  status: Product["status"];
};

export type ProductUpdate = Partial<Pick<Product, "sku" | "name" | "price">>;

export type StockAdjustPayload = {
  delta: number;
  reason?: "ADJUSTMENT" | "DAMAGE" | "RETURN" | "COUNT";
  note?: string;
};
export type StockAdjustResponse = {
  message: string;
  product: Product;
  movement: {
    id: number;
    delta: number;
    reason: string;
    note: string;
    created_at: string;
    product: number;
  };
};

// 🔹 NUEVO: tipo para movimientos
export type StockMovement = {
  id: number;
  product: number;
  product_sku: string;
  product_name: string;
  delta: number;
  reason: string;
  note: string;
  created_at: string;
};
export type DashboardLowStockItem = {
  id: number;
  sku: string;
  name: string;
  qty: number;
  status: Product["status"];
};

export type DashboardForecastItem = {
  sku: string;
  name: string;
  avg_daily_usage: number;
  days_to_zero: number | null;
  current_qty: number;
};

export type DashboardSummary = {
  total_products: number;
  total_stock: number;
  total_value: number;
  movements_last_7d: number;
  low_stock: DashboardLowStockItem[];
  forecast: DashboardForecastItem[];
};


export const InventoryApi = {
  list: () => api.get<Product[]>("/products/"),
  create: (p: Omit<Product, "id" | "updated_at">) =>
    api.post<Product>("/products/", p),

  

  // ESTE es el método para eliminar productos
  remove: (id: number) => api.delete(`/products/${id}/`),

  buy: (id: number, qty: number) =>
    api.post<BuyResponse>(`/products/${id}/buy/`, { qty }),

  update: (id: number, data: ProductUpdate) =>
    api.patch<Product>(`/products/${id}/`, data),

  adjust: (id: number, body: StockAdjustPayload) =>
    api.post<StockAdjustResponse>(`/products/${id}/adjust_stock/`, body),

  dashboard: () => api.get<DashboardSummary>("/dashboard/"),

  // 🔹 listar movimientos
  listMovements: (limit = 50) =>
    api.get<StockMovement[]>("/movements/", {
      params: { limit },
    }),
};
