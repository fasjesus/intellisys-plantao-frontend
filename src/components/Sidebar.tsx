import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Clock, Calendar, FileText, ChevronRight, LogOut } from 'lucide-react';
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
  onLogout?: () => void;
}

const menuItems = [
  { label: "Colaboradores", path: "/users",       icon: Users    },
  { label: "Plantões",      path: "/duty",         icon: Clock    },
  { label: "Escala",        path: "/scale/month",  icon: Calendar },
  { label: "Relatórios",    path: "/reports",      icon: FileText },
];

export function Sidebar({ isOpen, onToggle, onClose, onLogout }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const navItems = menuItems.map(({ label, path, icon: Icon }, index) => {
    const isActive = location.pathname.startsWith(path);
    return (
      <div key={path}>
        {index > 0 && <div className="mx-3 border-t border-gray-200" />}
        <button
          onClick={() => handleNavigate(path)}
          title={!isOpen ? label : undefined}
          className={[
            'w-full flex items-center gap-3 px-4 py-5 text-[11px] font-bold tracking-widest',
            'transition-all whitespace-nowrap overflow-hidden',
            isActive
              ? 'bg-[#B5071A] text-white'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
          ].join(' ')}
        >
          <Icon size={18} className="shrink-0" />
          {isOpen && <span className="uppercase truncate">{label}</span>}
        </button>
      </div>
    );
  });

  const logoutButton = () => (
    <div className="mt-auto">
      <div className="mx-3 border-t border-gray-200" />
{onLogout && (
        <button
          onClick={onLogout}
          title="Sair do sistema"
          className="w-full flex items-center gap-3 px-4 py-5 text-[11px] font-bold tracking-widest text-gray-500 hover:bg-red-50 hover:text-[#B5071A] transition-all whitespace-nowrap overflow-hidden"
        >
          <LogOut size={18} className="shrink-0" />
          {isOpen && <span className="uppercase">Sair</span>}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Wrapper relative para posicionar o botão toggle na borda */}
      <div className="relative hidden md:block shrink-0">
        <aside
          className={[
            'bg-white flex flex-col h-full transition-all duration-300 ease-in-out',
            'shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)]',
            isOpen ? 'w-56' : 'w-16',
          ].join(' ')}
        >
          <nav className="flex flex-col w-full flex-1">
            {navItems}
          </nav>
          {logoutButton()}
        </aside>

        {/* BOTÃO TOGGLE grudado na borda direita, centralizado verticalmente */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 z-40 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-400 hover:text-[#B5071A] hover:border-[#B5071A] transition-colors"
        >
          <ChevronRight
            size={14}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* SIDEBAR MOBILE */}
      <aside
        className={[
          'md:hidden bg-white flex flex-col transition-all duration-300 ease-in-out z-30',
          'shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)]',
          'fixed inset-y-0 left-0',
          isOpen ? 'w-56 translate-x-0' : 'w-56 -translate-x-full',
        ].join(' ')}
      >
        <nav className="flex flex-col w-full pt-2 flex-1">
          {menuItems.map(({ label, path, icon: Icon }, index) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <div key={path}>
                {index > 0 && <div className="mx-3 border-t border-gray-100" />}
                <button
                  onClick={() => handleNavigate(path)}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-5 text-[11px] font-bold tracking-widest',
                    'transition-all',
                    isActive
                      ? 'bg-[#B5071A] text-white'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                  ].join(' ')}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="uppercase truncate">{label}</span>
                </button>
              </div>
            );
          })}
        </nav>
        {logoutButton()}
      </aside>
    </>
  );
}
