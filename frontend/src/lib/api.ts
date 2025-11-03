import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

export type Product = {
  id: number;
  sku: string;
  name: string;
  qty: number;
  status: 'AVAILABLE' | 'PENDING' | 'OUT';
};

export const InventoryApi = {
  list: () => api.get<Product[]>('/products/'),
  create: (p: Omit<Product, 'id'>) => api.post<Product>('/products/', p),
  remove: (id: number) => api.delete(`/products/${id}/`),
  buy: (id: number, qty: number) => api.post<Product>(`/products/${id}/buy/`, { qty }),
};
