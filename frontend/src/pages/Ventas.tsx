import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  InventoryApi,
  type Product,
  type StockMovement,
} from "../lib/api";
import { useToast } from "../components/Toast";

/** IVA CL (19%) */
const IVA_RATE = 0.19;

type CartLine = { product: Product; qty: number };

export default function Ventas() {
  const { push } = useToast();

  // catálogo y estado de carga
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // historial de movimientos
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovs, setLoadingMovs] = useState(false);

  // búsqueda / selección
  const [skuQuery, setSkuQuery] = useState("");
  const [qtyToAdd, setQtyToAdd] = useState<number>(1);

  // carrito
  const [cart, setCart] = useState<CartLine[]>([]);
  const [confirming, setConfirming] = useState(false);

  // ------- cargar catálogo -------
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const r = await InventoryApi.list();
      setProducts(r.data);
    } catch {
      push({ type: "error", msg: "No se pudo cargar el catálogo" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  // ------- cargar historial -------
  const loadMovements = useCallback(async () => {
    try {
      setLoadingMovs(true);
      const r = await InventoryApi.listMovements(50);
      setMovements(r.data); // axios → respuesta en .data
    } catch {
      push({ type: "error", msg: "No se pudo cargar el historial" });
    } finally {
      setLoadingMovs(false);
    }
  }, [push]);

  useEffect(() => {
    void loadProducts();
    void loadMovements();
  }, [loadProducts, loadMovements]);

  // ------- helpers -------
  const findBySku = (sku: string) =>
    products.find(
      (p) => p.sku.toLowerCase() === sku.trim().toLowerCase()
    );

  const formatCLP = (n: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(n);

  // Totales (con price real)
  const subTotal = useMemo(
    () =>
      cart.reduce(
        (acc, line) => acc + line.qty * line.product.price,
        0
      ),
    [cart]
  );
  const iva = useMemo(
    () => Math.round(subTotal * IVA_RATE),
    [subTotal]
  );
  const total = useMemo(
    () => subTotal + iva,
    [subTotal, iva]
  );

  // ------- acciones -------
  const addToCart = () => {
    if (!skuQuery.trim())
      return push({ type: "error", msg: "Ingresa un SKU" });
    if (!Number.isFinite(qtyToAdd) || qtyToAdd <= 0)
      return push({ type: "error", msg: "Cantidad inválida" });

    const prod = findBySku(skuQuery);
    if (!prod)
      return push({
        type: "error",
        msg: `SKU "${skuQuery}" no encontrado`,
      });

    // validar stock disponible
    if (qtyToAdd > prod.qty)
      return push({
        type: "error",
        msg: `Stock insuficiente. Disponible: ${prod.qty}`,
      });

    setCart((prev) => {
      const i = prev.findIndex(
        (l) => l.product.id === prod.id
      );
      if (i >= 0) {
        const next = [...prev];
        const newQty = next[i].qty + qtyToAdd;
        if (newQty > prod.qty) {
          push({
            type: "error",
            msg: `No puedes superar el stock (${prod.qty})`,
          });
          return prev;
        }
        next[i] = { ...next[i], qty: newQty };
        return next;
      }
      return [...prev, { product: prod, qty: qtyToAdd }];
    });

    setQtyToAdd(1);
    setSkuQuery("");
  };

  const updateLineQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((l) =>
        l.product.id === id
          ? {
              ...l,
              qty: Math.max(
                1,
                Math.min(qty, l.product.qty)
              ), // entre 1 y stock
            }
          : l
      )
    );
  };

  const removeLine = (id: number) => {
    setCart((prev) =>
      prev.filter((l) => l.product.id !== id)
    );
  };

  const clearCart = () => setCart([]);

  const confirmPurchase = async () => {
    if (cart.length === 0)
      return push({
        type: "error",
        msg: "Carrito vacío",
      });

    try {
      setConfirming(true);

      // Ejecutar compras (serie para mensajes claros)
      for (const line of cart) {
        await InventoryApi.buy(
          line.product.id,
          line.qty
        );
      }

      // refresca historial y catálogo después
      await loadMovements();
      await loadProducts();

      push({
        type: "success",
        msg: "Compra realizada ✅",
      });
      clearCart();
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        Object.entries(err?.response?.data ?? {})
          .map(([k, v]) =>
            `${k}: ${
              Array.isArray(v) ? v.join(", ") : String(v)
            }`
          )
          .join(" · ") ||
        "No se pudo completar la compra";
      push({ type: "error", msg: `❌ ${msg}` });
    } finally {
      setConfirming(false);
    }
  };

  // ------- UI -------
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 16,
      }}
    >
      {/* Panel central: carrito / lista visual */}
      <div>
        <h1 style={{ marginTop: 0 }}>Punto de Venta</h1>

        {/* Barra para agregar por SKU */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            background: "#0f141b",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #131b25",
            marginBottom: 12,
          }}
        >
          <input
            placeholder="SKU (ej: SKU-001)"
            value={skuQuery}
            onChange={(e) =>
              setSkuQuery(e.target.value)
            }
            style={input}
            list="skus"
          />
          <datalist id="skus">
            {products.map((p) => (
              <option
                key={p.id}
                value={p.sku}
              >{`${p.name}`}</option>
            ))}
          </datalist>

          <input
            type="number"
            min={1}
            value={qtyToAdd}
            onChange={(e) =>
              setQtyToAdd(Number(e.target.value))
            }
            style={{
              ...input,
              width: 100,
              textAlign: "right",
            }}
          />
          <button
            onClick={addToCart}
            disabled={loading}
            style={btnPrimary}
          >
            ➕ Agregar
          </button>
          <button
            onClick={() => void loadProducts()}
            disabled={loading}
            style={btnGhost}
          >
            🔄 Catálogo
          </button>
        </div>

        {/* Tabla del carrito */}
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead style={{ background: "#0f1622" }}>
              <tr>
                <th style={th}>Nombre</th>
                <th style={th}>SKU</th>
                <th
                  style={{
                    ...th,
                    textAlign: "right",
                  }}
                >
                  Cantidad
                </th>
                <th
                  style={{
                    ...th,
                    textAlign: "center",
                  }}
                >
                  Stock
                </th>
                <th
                  style={{
                    ...th,
                    textAlign: "right",
                  }}
                >
                  Total
                </th>
                <th
                  style={{
                    ...th,
                    textAlign: "center",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 16,
                      opacity: 0.6,
                      textAlign: "center",
                    }}
                  >
                    Agrega productos por SKU para
                    comenzar
                  </td>
                </tr>
              ) : (
                cart.map((l) => (
                  <tr
                    key={l.product.id}
                    style={{
                      borderTop:
                        "1px solid #131b25",
                    }}
                  >
                    <td style={td}>
                      {l.product.name}
                    </td>
                    <td style={td}>
                      {l.product.sku}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        max={l.product.qty}
                        value={l.qty}
                        onChange={(e) =>
                          updateLineQty(
                            l.product.id,
                            Number(
                              e.target.value
                            )
                          )
                        }
                        style={{
                          ...input,
                          width: 100,
                          textAlign: "right",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "center",
                      }}
                    >
                      {l.product.qty}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                      }}
                    >
                      {formatCLP(
                        l.qty *
                          l.product
                            .price
                      )}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() =>
                          removeLine(
                            l.product.id
                          )
                        }
                        style={btnDanger}
                      >
                        🗑️ Quitar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel derecho: resumen final */}
      <aside
        style={{
          display: "grid",
          alignContent: "start",
          gap: 12,
          background: "#0f141b",
          border: "1px solid #131b25",
          borderRadius: 10,
          padding: 12,
        }}
      >
        <h2
          style={{
            margin: "4px 0 8px 0",
          }}
        >
          TOTAL FINAL
        </h2>

        <div style={summaryRow}>
          <span>Subtotal</span>
          <b>{formatCLP(subTotal)}</b>
        </div>
        <div style={summaryRow}>
          <span>
            IVA (
            {Math.round(
              IVA_RATE * 100
            )}
            %)
          </span>
          <b>{formatCLP(iva)}</b>
        </div>
        <div
          style={{
            ...summaryRow,
            borderTop:
              "1px solid #203048",
            paddingTop: 10,
          }}
        >
          <span>Total</span>
          <b>{formatCLP(total)}</b>
        </div>

        <button
          onClick={confirmPurchase}
          disabled={
            confirming || cart.length === 0
          }
          style={{
            ...btnPrimary,
            padding: "10px 12px",
            marginTop: 8,
            opacity: confirming ? 0.7 : 1,
            cursor: confirming
              ? "not-allowed"
              : "pointer",
          }}
        >
          {confirming
            ? "Procesando..."
            : "✅ Confirmar compra"}
        </button>

        <button
          onClick={clearCart}
          disabled={
            cart.length === 0 || confirming
          }
          style={btnGhost}
        >
          Limpiar carrito
        </button>

        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            opacity: 0.8,
            borderTop:
              "1px dashed #203048",
            paddingTop: 8,
          }}
        >
          <b>Panel</b> para métricas,
          insights o predicciones
          (placeholder).
        </div>
      </aside>

      {/* Historial reciente de movimientos */}
      <div
        style={{
          gridColumn: "1 / -1",
          marginTop: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <h2 style={{ margin: 0 }}>
            Historial reciente de
            movimientos
          </h2>
          <button
            onClick={() =>
              void loadMovements()
            }
            disabled={loadingMovs}
            style={btnGhost}
          >
            {loadingMovs
              ? "Actualizando..."
              : "🔄 Actualizar historial"}
          </button>
        </div>

        {loadingMovs && (
          <p>Cargando movimientos…</p>
        )}

        {!loadingMovs &&
          movements.length === 0 && (
            <p
              style={{
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              Aún no hay movimientos
              registrados.
            </p>
          )}

        {!loadingMovs &&
          movements.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead
                  style={{
                    background: "#0f1622",
                  }}
                >
                  <tr>
                    <th style={th}>Fecha</th>
                    <th style={th}>SKU</th>
                    <th style={th}>
                      Producto
                    </th>
                    <th
                      style={{
                        ...th,
                        textAlign: "right",
                      }}
                    >
                      Δ stock
                    </th>
                    <th style={th}>
                      Motivo
                    </th>
                    <th style={th}>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr
                      key={m.id}
                      style={{
                        borderTop:
                          "1px solid #131b25",
                      }}
                    >
                      <td style={td}>
                        {new Date(
                          m.created_at
                        ).toLocaleString(
                          "es-CL"
                        )}
                      </td>
                      <td style={td}>
                        {m.product_sku}
                      </td>
                      <td style={td}>
                        {m.product_name}
                      </td>
                      <td
                        style={{
                          ...td,
                          textAlign:
                            "right",
                        }}
                      >
                        {m.delta > 0
                          ? `+${m.delta}`
                          : m.delta}
                      </td>
                      <td style={td}>
                        {m.reason}
                      </td>
                      <td style={td}>
                        {m.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}

/* ---------- estilos inline consistentes con tu tema ---------- */
const input: React.CSSProperties = {
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid #203048",
  background: "#0b0f14",
  color: "#e6edf3",
  outline: "none",
};

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
};

const td: React.CSSProperties = {
  padding: 12,
};

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

const btnDanger: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 8,
  border: "1px solid #3a1a1e",
  background: "#2a0f13",
  color: "#fca5a5",
  cursor: "pointer",
};

const summaryRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "2px 0",
};
