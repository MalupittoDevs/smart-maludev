import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Boxes, DollarSign } from 'lucide-react';
import React from 'react';


export default function App() {
  const { pathname } = useLocation();
  return (
    <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'100vh',
                  background:'#0b0f14', color:'#e6edf3', fontFamily:'Inter, system-ui, sans-serif' }}>
      <aside style={{ borderRight:'1px solid #1a2330', padding:16 }}>
        <h2 style={{ margin:'0 0 16px 0' }}>Inventario Smart</h2>
        <nav style={{ display:'grid', gap:8 }}>
          <NavItem to="/" icon={<Home size={18}/>} active={pathname==='/'}>General</NavItem>
          <NavItem to="/inventario" icon={<Boxes size={18}/> } active={pathname.startsWith('/inventario')}>Inventario</NavItem>
          <NavItem to="/ventas" icon={<DollarSign size={18}/> } active={pathname.startsWith('/ventas')}>Ventas</NavItem>
        </nav>
      </aside>
      <main style={{ padding:20 }}>
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, children, active }:{
  to: string, icon: React.ReactNode, children: React.ReactNode, active?: boolean
}) {
  return (
    <Link to={to} style={{
      display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
      borderRadius:10, textDecoration:'none',
      color:'#e6edf3', background: active ? '#111822' : '#0f141b',
      border: active ? '1px solid #203048' : '1px solid #141a22'
    }}>
      {icon}<span>{children}</span>
    </Link>
  );
}
