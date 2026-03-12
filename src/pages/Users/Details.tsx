import { ArrowLeft, Mail, Phone, Calendar, ShieldCheck, UserCircle, Briefcase } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export function Details() {
  const navigate = useNavigate();
  const { id } = useParams();

  const user = {
    login: 'AFONSO',
    name: 'Afonso Jimenez Goméz Neves',
    code: '25487',
    status: 'Ativo',
    email: 'afonso.neves@intellisys.com.br',
    phone: '(73) 99999-0000',
    department: 'Desenvolvimento',
    hiringDate: '15/01/2024',
    role: 'Desenvolvedor Pleno',
    avatarUrl: '/src/assets/images/avatar.png' 
  };

  return (
    <div className="p-8 bg-white min-h-full font-inter">
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/users')} className="text-gray-800 hover:opacity-70 transition-opacity outline-none">
          <ArrowLeft size={32} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#B5071A]">Detalhes do Colaborador</h2>
          <p className="text-sm text-gray-500 font-medium">Informações completas de {user.name}.</p>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: IDENTIFICAÇÃO CORPORATIVA */}
        <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white flex flex-col">
          <div className="mb-4">
             <h3 className="text-[#B5071A] font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
               <ShieldCheck size={18} /> Identificação Corporativa
             </h3>
             {/* TAG DE STATUS 
             <div className="mt-1 ml-6">
                <span className={`px-0 py-0.5 text-[9px] font-bold rounded-md
                  ${user.status === 'Ativo' ? 'bg-white text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.status}
                </span>
             </div> */}
          </div>
          
          <div className="flex flex-row-reverse gap-6 items-center justify-between flex-1">
            {/* FOTO (DIREITA) */}
            <div className="flex-shrink-0 w-24 h-29 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={70} strokeWidth={1} className="text-gray-300" />
              )}
            </div>

            {/* DADOS (ESQUERDA) */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Nome Completo</p>
                <p className="text-base font-extrabold text-gray-700 leading-tight">{user.name}</p>
              </div>
              
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Código</p>
                  <p className="text-sm font-bold text-gray-700">{user.code}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Login</p>
                  <p className="text-sm font-bold text-gray-700">{user.login}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: CONTATO E LOCALIZAÇÃO */}
        <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
          <h3 className="text-[#B5071A] font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Mail size={18} /> Contato e Localização
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg"><Mail size={16} className="text-gray-400" /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">E-mail Corporativo</p>
                <p className="text-xs font-bold text-gray-700">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg"><Phone size={16} className="text-gray-400" /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Telefone / Ramal</p>
                <p className="text-xs font-bold text-gray-700">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: INFORMAÇÕES PROFISSIONAIS */}
        <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white md:col-span-2">
          <h3 className="text-[#B5071A] font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Briefcase size={18} /> Informações Profissionais
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Departamento</p>
              <p className="text-sm font-bold text-gray-700">{user.department}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Cargo Atual</p>
              <p className="text-sm font-bold text-gray-700">{user.role}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-300" /> Data de Admissão
              </p>
              <p className="text-sm font-bold text-gray-700">{user.hiringDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex justify-end gap-4 mt-12 max-w-5xl mx-auto">
        <button className="bg-[#B5071A] text-white px-10 py-2.5 rounded-xl font-bold text-sm shadow-md hover:brightness-110 transition-all active:scale-95">
          Editar Dados
        </button>
        <button 
          onClick={() => navigate('/users')}
          className="bg-[#1E293B] text-white px-10 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-slate-900 transition-all active:scale-95"
        >
          Voltar para Lista
        </button>
      </div>
    </div>
  );
}