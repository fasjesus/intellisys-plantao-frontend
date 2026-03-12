import React from 'react';

interface ToolCardProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void; 
}

export function ToolCard({ label, icon, onClick }: ToolCardProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none focus:ring-2 focus:ring-intellisys-red rounded-xl p-2 transition-all"
    >
      {/* Círculo do Ícone */}
      <div className="w-24 h-24 rounded-full border-2 border-[#B5071A] flex items-center justify-center text-[#B5071A] shadow-md group-hover:bg-[#B5071A] group-hover:text-white group-active:scale-95 transition-all duration-300">
        {/* O ícone passado via props é renderizado aqui */}
        {icon}
      </div>

      {/* Rótulo do Ícone */}
      <span className="mt-4 text-[#1E1E1E] font-inter font-medium text-lg group-hover:text-[#B5071A] transition-colors">
        {label}
      </span>
    </button>
  );
}