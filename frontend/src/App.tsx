import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Boxes, DollarSign, History } from "lucide-react";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        minHeight: "100vh",
        background: "#0b0f14",
        color: "#e6edf3",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          borderRight: "1px solid #111827",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, margin: 0, marginBottom: 4 }}>Inventario Smart</h1>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Smart MaluDev</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavItem
            to="/"
            icon={<Home size={18} />}
            active={pathname === "/"}
          >
            General
          </NavItem>

          <NavItem
            to="/inventario"
            icon={<Boxes size={18} />}
            active={pathname.startsWith("/inventario")}
          >
            Inventario
          </NavItem>

          <NavItem
            to="/ventas"
            icon={<DollarSign size={18} />}
            active={pathname.startsWith("/ventas")}
          >
            Ventas
          </NavItem>

          {/* 🔹 NUEVO: botón Movimientos */}
          <NavItem
            to="/movimientos"
            icon={<History size={18} />}
            active={pathname.startsWith("/movimientos")}
          >
            Movimientos
          </NavItem>
        </nav>
      </aside>

      {/* CONTENIDO CENTRAL */}
      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
};

function NavItem({ to, icon, children, active }: NavItemProps) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        textDecoration: "none",
        fontSize: 14,
        background: active ? "#111827" : "transparent",
        border: active ? "1px solid #1f2937" : "1px solid transparent",
        color: "#e5e7eb",
      }}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
