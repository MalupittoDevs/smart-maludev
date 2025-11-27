// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import General from "./pages/General";
import Inventory from "./pages/Inventory";
import Ventas from "./pages/Ventas";
import Movements from "./pages/Movements";

import { ToastProvider } from "./components/Toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <General /> },
      { path: "inventario", element: <Inventory /> },
      { path: "ventas", element: <Ventas /> },
      { path: "movimientos", element: <Movements /> }, // ← corregido
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </React.StrictMode>
);
