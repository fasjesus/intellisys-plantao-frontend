// src/components/Sidebar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react'; // Ícone para fechar no mobile

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void; // Prop opcional para fechar o menu
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "COLABORADORES", path: "/users" },
    { label: "PLANTÕES", path: "/plantoes" },
    { label: "ESCALA", path: "/scale/month" },
    { label: "RELATÓRIOS", path: "/reports" },
  ];

  return (
    <aside 
      className={`
        /* Cores e Comportamento Base */
        bg-white flex flex-col transition-all duration-300 ease-in-out z-50
        
        /* Mobile: Comportamento de Overlay (Fixo e fora da tela) */
        fixed inset-y-0 left-0 shadow-2xl md:shadow-none
        
        /* Desktop: Comportamento de Coluna (Relativo) */
        md:relative md:inset-auto md:translate-x-0
        
        /* Lógica de Abertura/Fechamento */
        ${isOpen 
          ? 'w-64 translate-x-0 opacity-100 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.07)]' 
          : 'w-64 -translate-x-full md:w-0 md:opacity-0 md:pointer-events-none'}
      `}
    >
      {/* Botão de Fechar - Visível apenas no Mobile quando aberto */}
      <div className="flex justify-end p-4 md:hidden">
        <button 
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-[#B5071A] transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <nav className={`flex flex-col w-full ${!isOpen && 'md:hidden'}`}>
        {menuItems.map((item) => {
          // Verifica se a rota atual contém o path do item
          const isActive = location.pathname.includes(item.path);

          return (
            <button
              key={item.label}
              onClick={() => {
                const target = item.label === "ESCALA" ? "/scale/month" : item.path;
                navigate(target);
                // No mobile, fecha a sidebar após clicar em um item
                if (window.innerWidth < 768 && onClose) onClose();
              }}
              className={`w-full text-left px-6 py-5 text-[11px] font-bold tracking-widest border-b border-gray-50 transition-all
                ${isActive 
                  ? 'bg-[#B5071A] text-white' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
            >
              <span className="block truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}