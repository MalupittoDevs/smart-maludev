// frontend/src/pages/Movements.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InventoryApi, type StockMovement } from "../lib/api";
import { useToast } from "../components/Toast";

const REASON_LABELS: Record<string, string> = {
  ADJUSTMENT: "Ajuste manual",
  DAMAGE: "Merma / Daño",
  RETURN: "Devolución",
  COUNT: "Diferencia inventario",
};

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

export default function Movements() {
  const { push } = useToast();

  const [rows, setRows] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(50);

  const [qSku, setQSku] = useState("");
  const [qName, setQName] = useState("");
  const [qReason, setQReason] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await InventoryApi.listMovements(limit);
      setRows(r.data);
    } catch (err) {
      console.error(err);
      push({ type: "error", msg: "No se pudo cargar el historial de movimientos" });
    } finally {
      setLoading(false);
    }
  }, [limit, push]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () =>
      rows.filter((m) => {
        if (qSku && !m.product_sku.toLowerCase().includes(qSku.toLowerCase())) return false;
        if (qName && !m.product_name.toLowerCase().includes(qName.toLowerCase())) return false;
        if (qReason && m.reason !== qReason) return false;
        return true;
      }),
    [rows, qSku, qName, qReason]
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Historial de movimientos</h1>
        <span style={{ opacity: 0.8, fontSize: 13 }}>
          Últimos <b>{limit}</b> movimientos registrados.
        </span>
        <button onClick={() => void load()} disabled={loading} style={btnPrimary}>
          🔄 Actualizar
        </button>
      </div>

      {/* filtros */}
      <div style={{ display: "flex", gap: 8, margin: "8px 0 12px", flexWrap: "wrap" }}>
        <input placeholder="SKU" value={qSku} onChange={(e) => setQSku(e.target.value)} style={input} />
        <input
          placeholder="Nombre producto"
          value={qName}
          onChange={(e) => setQName(e.target.value)}
          style={input}
        />
        <select value={qReason} onChange={(e) => setQReason(e.target.value)} style={input as any}>
          <option value="">Motivo: todos</option>
          <option value="ADJUSTMENT">Ajuste manual</option>
          <option value="DAMAGE">Merma / Daño</option>
          <option value="RETURN">Devolución</option>
          <option value="COUNT">Diferencia inventario</option>
        </select>

        <select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value) || 50)} style={input as any}>
          <option value="20">Últimos 20</option>
          <option value="50">Últimos 50</option>
          <option value="100">Últimos 100</option>
        </select>
      </div>

      {/* tabla */}
      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead style={{ background: "#0f1622" }}>
            <tr>
              <th style={th}>Fecha</th>
              <th style={th}>SKU</th>
              <th style={th}>Producto</th>
              <th style={{ ...th, textAlign: "right" }}>Δ stock</th>
              <th style={th}>Motivo</th>
              <th style={th}>Nota</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} style={{ borderTop: "1px solid #131b25" }}>
                <td style={td}>{formatDateTime(m.created_at)}</td>
                <td style={td}>{m.product_sku}</td>
                <td style={td}>{m.product_name}</td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    color: m.delta > 0 ? "#4caf50" : m.delta < 0 ? "#f44336" : "#e6edf3",
                    fontWeight: 600,
                  }}
                >
                  {m.delta > 0 ? `+${m.delta}` : m.delta}
                </td>
                <td style={td}>
                  <span style={badge}>{REASON_LABELS[m.reason] ?? m.reason}</span>
                </td>
                <td style={td}>{m.note || "—"}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, opacity: 0.7, textAlign: "center" }}>
                  Sin movimientos para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* estilos */
const table: React.CSSProperties = {
  width: "100%",
  background: "#0f141b",
  border: "1px solid #131b25",
  borderRadius: 10,
  borderCollapse: "collapse",
};

const th: React.CSSProperties = { textAlign: "left", padding: 12, color: "#9fb3c8", fontSize: 12 };
const td: React.CSSProperties = { padding: 12, fontSize: 13 };

const input: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid #203048",
  background: "#0b0f14",
  color: "#e6edf3",
  outline: "none",
};

const btnPrimary: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #203048",
  background: "#182330",
  color: "#e6edf3",
  cursor: "pointer",
  fontSize: 13,
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 11,
  background: "#182330",
  border: "1px solid #203048",
};
