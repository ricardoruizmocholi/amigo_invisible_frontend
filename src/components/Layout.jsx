import { CircleUserRound, Gift, House, MapPinned, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth.jsx';

export default function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const tabs = [
    { to: '/', label: 'Inicio', icon: House },
    { to: '/quedada', label: 'Quedada', icon: MapPinned },
    { to: '/amigo-invisible', label: 'Amigo', icon: Gift },
    ...(user.isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
    { to: '/perfil', label: 'Perfil', icon: CircleUserRound },
  ];

  return (
    <div className="app">
      <main className="page">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Secciones">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="tabbar__link">
            <Icon size={22} strokeWidth={2.4} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
