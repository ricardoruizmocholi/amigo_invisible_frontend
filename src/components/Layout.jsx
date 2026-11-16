import { CircleUserRound, Gift, House, MapPinned, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth.jsx';

const ICON_SIZE = 22;
const ROW = 28;
const LOOPS = 12;

export default function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [spinningTo, setSpinningTo] = useState(null);

  const tabs = useMemo(
    () => [
      { to: '/', label: 'Inicio', icon: House },
      { to: '/quedada', label: 'Quedada', icon: MapPinned },
      { to: '/amigo-invisible', label: 'Amigo', icon: Gift },
      ...(user.isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
      { to: '/perfil', label: 'Perfil', icon: CircleUserRound },
    ],
    [user.isAdmin],
  );

  const icons = useMemo(() => tabs.map((tab) => tab.icon), [tabs]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!spinningTo) return undefined;
    const timer = window.setTimeout(() => setSpinningTo(null), 1800);
    return () => window.clearTimeout(timer);
  }, [spinningTo]);

  return (
    <div className="app">
      <main className="page">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Secciones">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `tabbar__link${isActive ? ' active' : ''}`}
            onClick={() => setSpinningTo(to)}
          >
            {({ isActive }) => (
              <>
                <TabReel
                  icons={icons}
                  face={icon}
                  active={isActive}
                  spinning={spinningTo === to}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function TabReel({ icons, face, active, spinning }) {
  const strip = useMemo(() => buildStrip(icons, face), [icons, face]);
  const stopIndex = strip.lastIndexOf(face);
  const target = stopIndex * ROW;
  const [offset, setOffset] = useState(target);
  const [animate, setAnimate] = useState(false);
  const stripRef = useRef(null);

  useEffect(() => {
    if (!spinning) {
      setAnimate(false);
      setOffset(target);
      return undefined;
    }

    setAnimate(false);
    setOffset(0);
    const start = window.requestAnimationFrame(() => {
      if (stripRef.current) void stripRef.current.offsetHeight;
      setAnimate(true);
      setOffset(target);
    });
    return () => window.cancelAnimationFrame(start);
  }, [spinning, target]);

  return (
    <span className={`tabbar__reel${active ? ' tabbar__reel--active' : ''}`} aria-hidden="true">
      <span
        ref={stripRef}
        className="tabbar__strip"
        style={{
          transform: `translateY(${-offset}px)`,
          transitionDuration: animate ? '1.55s' : '0s',
        }}
      >
        {strip.map((Icon, index) => (
          <span key={`${Icon.displayName ?? Icon.name}-${index}`} className="tabbar__face">
            <Icon size={ICON_SIZE} strokeWidth={2.4} />
          </span>
        ))}
      </span>
    </span>
  );
}

function buildStrip(icons, face) {
  const base = icons.length > 0 ? icons : [face];
  const strip = [];
  for (let loop = 0; loop < LOOPS; loop += 1) {
    for (const icon of base) strip.push(icon);
  }
  strip.push(face);
  return strip;
}
