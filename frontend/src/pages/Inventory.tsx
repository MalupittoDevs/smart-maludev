import React, { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Product } from "../lib/api";
import { useToast } from "../components/Toast";

type NewProduct = Omit<Product, "id">;

const emptyDraft: NewProduct = {
  sku: "",
  name: "",
  qty: 0,
  status: "AVAILABLE",
};

export default function Inventory() {
  const { push } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<NewProduct>(emptyDraft);

  // 1) load memorizado para satisfacer react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await api.get<Product[]>("/products/");
      setItems(r.data);
    } catch {
      push({ type: "error", msg: "Error al cargar inventario" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  // 2) useEffect depende de load
  useEffect(() => {
    void load();
  }, [load]);

  // 3) crear con manejo de errores más claro (ej: SKU duplicado)
  const create = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!draft.sku.trim() || !draft.name.trim()) {
      push({ type: "error", msg: "Completa todos los campos" });
      return;
    }
    if (!Number.isFinite(draft.qty) || draft.qty < 0) {
      push({ type: "error", msg: "Cantidad inválida" });
      return;
    }

    try {
      const r = await api.post<Product>("/products/", {
        sku: draft.sku.trim(),
        name: draft.name.trim(),
        qty: Number(draft.qty),
        status: draft.status,
      });
      setItems((prev) => [...prev, r.data]);
      setDraft(emptyDraft);
      push({ type: "success", msg: "Producto agregado" });
    } catch (err: any) {
      // Intenta leer mensaje del backend (DRF suele enviar {detail} o {campo: [errores]})
      const msg =
        err?.response?.data?.detail ||
        Object.entries(err?.response?.data ?? {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
          .join(" · ") ||
        "Error al agregar producto";

      push({ type: "error", msg });
    }
  };

  return (
    <div>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <h1 style={{ margin: 0 }}>Inventario</h1>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #203048",
            background: "#0f141b",
            color: "#e6edf3",
            cursor: loading ? "not-allowed" : "pointer",
          }}
          title="Refrescar"
        >
          {loading ? "Cargando..." : "🔄 Refrescar"}
        </button>
      </header>

      <form
        onSubmit={create}
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 14,
          background: "#0f141b",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #131b25",
        }}
      >
        <input
          placeholder="SKU"
          value={draft.sku}
          onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Nombre"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Cant."
          value={draft.qty}
          onChange={(e) => setDraft({ ...draft, qty: Number(e.target.value) })}
          style={{ ...inputStyle, width: 90, textAlign: "right" }}
        />
        <button
          type="submit"
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #203048",
            background: "#182330",
            color: "#e6edf3",
            cursor: "pointer",
          }}
        >
          ➕ Agregar
        </button>
      </form>

      <table
        style={{
          width: "100%",
          background: "#0f141b",
          border: "1px solid #131b25",
          borderRadius: 10,
          borderCollapse: "collapse",
        }}
      >
        <thead style={{ background: "#0f1622" }}>
          <tr>
            <Th>SKU</Th>
            <Th>Nombre</Th>
            <Th align="right">Cant.</Th>
            <Th align="center">Estado</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} style={{ padding: 16, textAlign: "center", opacity: 0.8 }}>
                Cargando...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: 16, textAlign: "center", opacity: 0.6 }}>
                Sin productos
              </td>
            </tr>
          ) : (
            items.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #131b25" }}>
                <Td>{p.sku}</Td>
                <Td>{p.name}</Td>
                <Td align="right">{p.qty}</Td>
                <Td align="center">{p.status}</Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid #203048",
  background: "#0b0f14",
  color: "#e6edf3",
  outline: "none",
};

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return <th style={{ textAlign: align, padding: 12, color: "#9fb3c8" }}>{children}</th>;
}
function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return <td style={{ textAlign: align, padding: 12 }}>{children}</td>;
}
