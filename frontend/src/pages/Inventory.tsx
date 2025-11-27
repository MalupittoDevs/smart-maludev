import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InventoryApi, type Product } from "../lib/api";
import { useToast } from "../components/Toast";

/* --- helpers de dinero --- */
const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.trunc(n || 0)));

const parseCLP = (s: string) => Number(String(s).replace(/[^\d]/g, "")) || 0;

export default function Inventory() {
  const { push } = useToast();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  /* --- creación --- */
  const [creating, setCreating] = useState(false);
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newStatus, setNewStatus] =
    useState<"AVAILABLE" | "PENDING" | "OUT">("AVAILABLE");

  /* --- edición --- */
  const [editing, setEditing] = useState<Product | null>(null);
  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);

  /* --- ajuste de stock --- */
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState<
    "ADJUSTMENT" | "DAMAGE" | "RETURN" | "COUNT"
  >("ADJUSTMENT");
  const [note, setNote] = useState("");

  /* --- filtros / orden --- */
  const [qSku, setQSku] = useState("");
  const [qName, setQName] = useState("");
  const [qStatus, setQStatus] = useState<"" | "AVAILABLE" | "PENDING" | "OUT">(
    ""
  );
  const [sortKey, setSortKey] = useState<"sku" | "name" | "qty" | "status" | "price">(
    "sku"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await InventoryApi.list();
      setItems(r.data);
    } catch {
      push({ type: "error", msg: "No se pudo cargar Inventario" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void load();
  }, [load]);

  /* --- derivados --- */
  const totalValor = useMemo(
    () => items.reduce((acc, p) => acc + p.qty * (p.price || 0), 0),
    [items]
  );

  const filteredSorted = useMemo(() => {
    const f = items.filter(
      (p) =>
        p.sku.toLowerCase().includes(qSku.toLowerCase()) &&
        p.name.toLowerCase().includes(qName.toLowerCase()) &&
        (qStatus ? p.status === qStatus : true)
    );
    const dir = sortDir === "asc" ? 1 : -1;
    return f.sort((a, b) => {
      const A: any = a[sortKey];
      const B: any = b[sortKey];
      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });
  }, [items, qSku, qName, qStatus, sortKey, sortDir]);

  const toggleSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  /* --- edición --- */
  const onOpenEdit = (p: Product) => {
    setEditing(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormPrice(p.price ?? 0);
  };

  const onCloseEdit = () => {
    setEditing(null);
    setFormSku("");
    setFormName("");
    setFormPrice(0);
  };

  const onSaveEdit = async () => {
    if (!editing) return;
    try {
      if (!formSku.trim())
        return push({ type: "error", msg: "SKU no puede estar vacío" });
      if (!formName.trim())
        return push({ type: "error", msg: "Nombre no puede estar vacío" });
      if (!Number.isFinite(formPrice) || formPrice < 0)
        return push({ type: "error", msg: "Precio inválido" });

      await InventoryApi.update(editing.id, {
        sku: formSku.trim(),
        name: formName.trim(),
        price: Math.round(formPrice),
      });
      push({ type: "success", msg: "Producto actualizado" });
      onCloseEdit();
      await load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        Object.entries(err?.response?.data ?? {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
          .join(" · ") ||
        "No se pudo actualizar";
      push({ type: "error", msg });
    }
  };

  /* --- ajuste de stock --- */
  const openAdjust = (p: Product) => {
    setAdjusting(p);
    setDelta(0);
    setReason("ADJUSTMENT");
    setNote("");
  };
  const closeAdjust = () => setAdjusting(null);

  const saveAdjust = async () => {
    if (!adjusting) return;
    if (!Number.isFinite(delta) || delta === 0)
      return push({ type: "error", msg: "El delta debe ser distinto de 0" });
    try {
      await InventoryApi.adjust(adjusting.id, {
        delta: Math.trunc(delta),
        reason,
        note,
      });
      push({ type: "success", msg: "Ajuste aplicado" });
      closeAdjust();
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "No se pudo aplicar el ajuste";
      push({ type: "error", msg });
    }
  };

  /* --- creación --- */
  const openCreate = () => {
    setCreating(true);
    setNewSku("");
    setNewName("");
    setNewQty(0);
    setNewPrice(0);
    setNewStatus("AVAILABLE");
  };

  const closeCreate = () => {
    setCreating(false);
  };

  const saveCreate = async () => {
    try {
      if (!newSku.trim())
        return push({ type: "error", msg: "SKU no puede estar vacío" });
      if (!newName.trim())
        return push({ type: "error", msg: "Nombre no puede estar vacío" });
      if (!Number.isFinite(newQty) || newQty < 0)
        return push({ type: "error", msg: "Cantidad inválida" });
      if (!Number.isFinite(newPrice) || newPrice < 0)
        return push({ type: "error", msg: "Precio inválido" });

      await InventoryApi.create({
        sku: newSku.trim(),
        name: newName.trim(),
        qty: Math.trunc(newQty),
        status: newStatus,
        price: Math.round(newPrice),
      });

      push({ type: "success", msg: "Producto creado" });
      setCreating(false);
      await load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        Object.entries(err?.response?.data ?? {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
          .join(" · ") ||
        "No se pudo crear el producto";
      push({ type: "error", msg });
    }
  };

  /* --- eliminar producto --- */
  const handleDeleteProduct = async (product: Product) => {
    const ok = window.confirm(
      `¿Eliminar el producto ${product.sku} — ${product.name}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      await InventoryApi.remove(product.id);

      setItems((prev) => prev.filter((p) => p.id !== product.id));

      push({
        type: "success",
        msg: `Producto ${product.sku} eliminado correctamente`,
      });
    } catch (err) {
      console.error(err);
      push({
        type: "error",
        msg: "No se pudo eliminar el producto. Intenta nuevamente.",
      });
    }
  };

  /* --- UI --- */
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Inventario</h1>
        <span style={{ opacity: 0.8 }}>
          Valor total: <b>{formatCLP(totalValor)}</b>
        </span>
        <button onClick={openCreate} style={btnPrimary}>
          ➕ Agregar producto
        </button>
        <button
          onClick={() => void load()}
          disabled={loading}
          style={btnGhost}
        >
          🔄 Refrescar
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
        <input
          placeholder="SKU"
          value={qSku}
          onChange={(e) => setQSku(e.target.value)}
          style={input}
        />
        <input
          placeholder="Nombre"
          value={qName}
          onChange={(e) => setQName(e.target.value)}
          style={input}
        />
        <select
          value={qStatus}
          onChange={(e) => setQStatus(e.target.value as any)}
          style={input as any}
        >
          <option value="">Estado: todos</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="PENDING">PENDING</option>
          <option value="OUT">OUT</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead style={{ background: "#0f1622" }}>
            <tr>
              <th style={th} onClick={() => toggleSort("sku")}>
                SKU
              </th>
              <th style={th} onClick={() => toggleSort("name")}>
                Nombre
              </th>
              <th
                style={{ ...th, textAlign: "right" }}
                onClick={() => toggleSort("qty")}
              >
                Cant.
              </th>
              <th style={th} onClick={() => toggleSort("status")}>
                Estado
              </th>
              <th
                style={{ ...th, textAlign: "right" }}
                onClick={() => toggleSort("price")}
              >
                Precio
              </th>
              <th style={{ ...th, textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #131b25" }}>
                <td style={td}>{p.sku}</td>
                <td style={td}>{p.name}</td>
                <td style={{ ...td, textAlign: "right" }}>{p.qty}</td>
                <td style={td}>{p.status}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  {formatCLP(p.price ?? 0)}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "center",
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <button onClick={() => onOpenEdit(p)} style={btnPrimary}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => openAdjust(p)} style={btnGhost}>
                    🧮 Ajustar
                  </button>
                  <button
                    onClick={() => void handleDeleteProduct(p)}
                    style={btnGhost}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {filteredSorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 16,
                    opacity: 0.7,
                    textAlign: "center",
                  }}
                >
                  Sin productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal de creación --- */}
      {creating && (
        <div style={modalBackdrop} onClick={closeCreate}>
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <h3 style={{ marginTop: 0 }}>Agregar producto</h3>

            <label style={label}>SKU</label>
            <input
              style={input}
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
            />

            <label style={label}>Nombre</label>
            <input
              style={input}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <label style={label}>Cantidad inicial</label>
            <input
              type="number"
              style={input}
              value={newQty}
              onChange={(e) => setNewQty(Number(e.target.value))}
            />

            <label style={label}>Precio</label>
            <input
              style={input}
              inputMode="numeric"
              value={formatCLP(newPrice)}
              onChange={(e) => setNewPrice(parseCLP(e.target.value))}
            />

            <label style={label}>Estado</label>
            <select
              style={input as any}
              value={newStatus}
              onChange={(e) =>
                setNewStatus(
                  e.target.value as "AVAILABLE" | "PENDING" | "OUT"
                )
              }
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="PENDING">PENDING</option>
              <option value="OUT">OUT</option>
            </select>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                justifyContent: "flex-end",
              }}
            >
              <button onClick={closeCreate} style={btnGhost}>
                Cancelar
              </button>
              <button onClick={saveCreate} style={btnPrimary}>
                ➕ Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal de edición --- */}
      {editing && (
        <div style={modalBackdrop} onClick={onCloseEdit}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Editar producto</h3>

            <label style={label}>SKU</label>
            <input
              style={input}
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
            />

            <label style={label}>Nombre</label>
            <input
              style={input}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />

            <label style={label}>Precio</label>
            <input
              style={input}
              inputMode="numeric"
              value={formatCLP(formPrice)}
              onChange={(e) => setFormPrice(parseCLP(e.target.value))}
            />

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                justifyContent: "flex-end",
              }}
            >
              <button onClick={onCloseEdit} style={btnGhost}>
                Cancelar
              </button>
              <button onClick={onSaveEdit} style={btnPrimary}>
                💾 Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal de ajuste --- */}
      {adjusting && (
        <div style={modalBackdrop} onClick={closeAdjust}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>
              Ajustar stock —{" "}
              <span style={{ opacity: 0.9 }}>{adjusting.name}</span>
            </h3>

            <label style={label}>Delta (usa negativo para restar)</label>
            <input
              type="number"
              style={input}
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
            />

            <label style={label}>Motivo</label>
            <select
              style={input as any}
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
            >
              <option value="ADJUSTMENT">Ajuste manual</option>
              <option value="DAMAGE">Merma / Daño</option>
              <option value="RETURN">Devolución</option>
              <option value="COUNT">Diferencia inventario</option>
            </select>

            <label style={label}>Nota (opcional)</label>
            <input
              style={input}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                justifyContent: "flex-end",
              }}
            >
              <button onClick={closeAdjust} style={btnGhost}>
                Cancelar
              </button>
              <button onClick={saveAdjust} style={btnPrimary}>
                💾 Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----- estilos mínimos ----- */
const table: React.CSSProperties = {
  width: "100%",
  background: "#0f141b",
  border: "1px solid #131b25",
  borderRadius: 10,
  borderCollapse: "collapse",
};
const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  color: "#9fb3c8",
  cursor: "pointer",
};
const td: React.CSSProperties = { padding: 12 };
const btnPrimary: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #203048",
  background: "#182330",
  color: "#e6edf3",
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #203048",
  background: "transparent",
  color: "#e6edf3",
  cursor: "pointer",
};
const input: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid #203048",
  background: "#0b0f14",
  color: "#e6edf3",
  outline: "none",
};
const label: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.8,
  marginTop: 8,
  marginBottom: 4,
};
const modalBackdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.4)",
  display: "grid",
  placeItems: "center",
  zIndex: 40,
};
const modal: React.CSSProperties = {
  width: 480,
  maxWidth: "95vw",
  background: "#0f141b",
  border: "1px solid #203048",
  borderRadius: 12,
  padding: 16,
};
