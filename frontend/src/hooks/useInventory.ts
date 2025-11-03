import { useCallback, useEffect, useMemo, useState } from 'react';
import { InventoryApi, type Product } from '@/lib/api';

type State = {
  items: Product[];
  loading: boolean;
  error: string | null;
};

export function useInventory() {
  const [{ items, loading, error }, setState] = useState<State>({
    items: [],
    loading: false,
    error: null,
  });

  const setLoading = useCallback((v: boolean) => {
    setState((s) => ({ ...s, loading: v }));
  }, []);

  const setError = useCallback((msg: string | null) => {
    setState((s) => ({ ...s, error: msg }));
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await InventoryApi.list();
      setState({ items: data, loading: false, error: null });
    } catch (e: any) {
      setLoading(false);
      setError(e?.message ?? 'Error al cargar inventario');
    }
  }, [setLoading, setError]);

  const create = useCallback(
    async (p: Omit<Product, 'id'>) => {
      try {
        setLoading(true);
        setError(null);
        await InventoryApi.create(p);
        await refresh();
      } catch (e: any) {
        setLoading(false);
        setError(e?.message ?? 'Error al crear producto');
        throw e;
      }
    },
    [refresh, setLoading, setError]
  );

  const remove = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        await InventoryApi.remove(id);
        await refresh();
      } catch (e: any) {
        setLoading(false);
        setError(e?.message ?? 'Error al eliminar producto');
        throw e;
      }
    },
    [refresh, setLoading, setError]
  );

  const buy = useCallback(
    async (id: number, qty: number) => {
      try {
        setLoading(true);
        setError(null);
        await InventoryApi.buy(id, qty);
        await refresh();
      } catch (e: any) {
        setLoading(false);
        setError(e?.message ?? 'Error al comprar');
        throw e;
      }
    },
    [refresh, setLoading, setError]
  );

  // Carga inicial
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Exponer un API estable (memo)
  const api = useMemo(
    () => ({ items, loading, error, refresh, create, remove, buy }),
    [items, loading, error, refresh, create, remove, buy]
  );

  return api;
}
