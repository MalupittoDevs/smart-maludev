import React, { useEffect, useState } from "react";
import { InventoryApi, type DashboardSummary } from "../lib/api";
import { useToast } from "../components/Toast";

export default function General() {
  const { push } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCLP = (n: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(n);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await InventoryApi.dashboard();
        setData(res.data);
      } catch {
        push({ type: "error", msg: "No se pudo cargar el dashboard" });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [push]);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>General</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Resumen del inventario Smart MaluDev y proyección básica de stock.
      </p>

      {loading && <p>Cargando dashboard…</p>}

      {!loading && data && (
        <>
          {/* Tarjetas de resumen */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <DashCard
              label="Productos registrados"
              value={data.total_products.toString()}
              subtitle="SKU únicos en el sistema"
            />
            <DashCard
              label="Stock total"
              value={data.total_stock.toString()}
              subtitle="Unidades disponibles"
            />
            <DashCard
              label="Valor estimado de inventario"
              value={formatCLP(data.total_value)}
              subtitle="Precio × cantidad"
            />
            <DashCard
              label="Movimientos últimos 7 días"
              value={data.movements_last_7d.toString()}
              subtitle="Ajustes y ventas"
            />
          </section>

          {/* Tabla de stock crítico */}
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Productos con stock crítico</h2>
            {data.low_stock.length === 0 ? (
              <p style={{ fontSize: 13, opacity: 0.7 }}>
                No hay productos bajo el umbral crítico (≤ 5 unidades).
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={table}>
                  <thead style={{ background: "#0f1622" }}>
                    <tr>
                      <th style={th}>SKU</th>
                      <th style={th}>Producto</th>
                      <th style={{ ...th, textAlign: "right" }}>Stock</th>
                      <th style={th}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.low_stock.map((p) => (
                      <tr key={p.id} style={{ borderTop: "1px solid #131b25" }}>
                        <td style={td}>{p.sku}</td>
                        <td style={td}>{p.name}</td>
                        <td style={{ ...td, textAlign: "right" }}>{p.qty}</td>
                        <td style={td}>
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Proyección de agotamiento (gancho Prophet) */}
          <section>
            <h2 style={{ marginBottom: 8 }}>Proyección de agotamiento (beta)</h2>
            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
              Esta proyección se calcula con el consumo promedio diario de los
              últimos 30 días. En futuras iteraciones este módulo se conectará
              a Prophet para mejorar la precisión del modelo.
            </p>

            {data.forecast.length === 0 ? (
              <p style={{ fontSize: 13, opacity: 0.7 }}>
                No hay datos suficientes de movimientos para estimar agotamiento.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={table}>
                  <thead style={{ background: "#0f1622" }}>
                    <tr>
                      <th style={th}>SKU</th>
                      <th style={th}>Producto</th>
                      <th style={{ ...th, textAlign: "right" }}>Stock actual</th>
                      <th style={{ ...th, textAlign: "right" }}>
                        Consumo diario prom. (u/día)
                      </th>
                      <th style={{ ...th, textAlign: "right" }}>
                        Días estimados hasta 0
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.forecast.map((f) => (
                      <tr key={f.sku} style={{ borderTop: "1px solid #131b25" }}>
                        <td style={td}>{f.sku}</td>
                        <td style={td}>{f.name}</td>
                        <td style={{ ...td, textAlign: "right" }}>{f.current_qty}</td>
                        <td style={{ ...td, textAlign: "right" }}>
                          {f.avg_daily_usage.toFixed(2)}
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          {f.days_to_zero === null
                            ? "N/A"
                            : f.days_to_zero.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

/* ---- componentes y estilos auxiliares ---- */

function DashCard(props: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        background: "#0f141b",
        borderRadius: 10,
        border: "1px solid #131b25",
        padding: 12,
        display: "grid",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 12, opacity: 0.7 }}>{props.label}</span>
      <span style={{ fontSize: 22, fontWeight: 600 }}>{props.value}</span>
      {props.subtitle && (
        <span style={{ fontSize: 11, opacity: 0.7 }}>{props.subtitle}</span>
      )}
    </div>
  );
}

function StatusBadge(props: { status: "AVAILABLE" | "PENDING" | "OUT" }) {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
  };

  if (props.status === "AVAILABLE") {
    return (
      <span
        style={{
          ...base,
          background: "#052e16",
          color: "#bbf7d0",
          border: "1px solid #166534",
        }}
      >
        Disponible
      </span>
    );
  }
  if (props.status === "PENDING") {
    return (
      <span
        style={{
          ...base,
          background: "#1e293b",
          color: "#e5e7eb",
          border: "1px solid #f97316",
        }}
      >
        En espera
      </span>
    );
  }
  return (
    <span
      style={{
        ...base,
        background: "#450a0a",
        color: "#fecaca",
        border: "1px solid #b91c1c",
      }}
    >
      Agotado
    </span>
  );
}

const table: React.CSSProperties = {
  width: "100%",
  background: "#0f141b",
  border: "1px solid #131b25",
  borderRadius: 10,
  borderCollapse: "collapse",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 10,
  color: "#9fb3c8",
  fontSize: 12,
};

const td: React.CSSProperties = {
  padding: 10,
  fontSize: 13,
};
