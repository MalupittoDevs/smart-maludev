import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import React from 'react';

type Product = { id: number; sku: string; name: string; qty: number; status: string };

export default function Inventory() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => { api.get<Product[]>('/products/').then(r => setItems(r.data)); }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Inventario</h1>
      <table style={{ width: '100%', background: '#0f141b', border: '1px solid #131b25',
                      borderRadius: 10, borderCollapse: 'collapse' }}>
        <thead style={{ background: '#0f1622' }}>
          <tr><Th>SKU</Th><Th>Nombre</Th><Th align="right">Cant.</Th><Th align="center">Estado</Th></tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #131b25' }}>
              <Td>{p.sku}</Td><Td>{p.name}</Td><Td align="right">{p.qty}</Td><Td align="center">{p.status}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left'|'center'|'right' }) {
  return <th style={{ textAlign: align, padding: 12, color: '#9fb3c8' }}>{children}</th>;
}
function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left'|'center'|'right' }) {
  return <td style={{ textAlign: align, padding: 12 }}>{children}</td>;
}
