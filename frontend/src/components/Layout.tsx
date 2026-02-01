import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: '대시보드' },
  { to: '/tasks', label: '항목 관리' },
  { to: '/stats', label: '통계' },
  { to: '/settings', label: '설정' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <span className="font-bold text-lg text-slate-800 shrink-0">⏱ Alert</span>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
