import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, ShieldCheck, UserCircle, Briefcase, Save, X } from 'lucide-react';

export function Edit() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estado inicial com os dados do colaborador
  const [formData, setFormData] = useState({
    login: 'AFONSO',
    name: 'Afonso Jimenez Goméz Neves',
    code: '25487',
    status: 'Ativo',
    email: 'afonso.neves@intellisys.com.br',
    phone: '(73) 99999-0000',
    department: 'Desenvolvimento',
    hiringDate: '2024-01-15', // Formato yyyy-mm-dd para o input date
    role: 'Desenvolvedor Pleno',
    avatarUrl: '/src/assets/images/avatar.png' 
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Salvando alterações:", formData);
    alert("Dados atualizados com sucesso!");
    navigate(`/users/details/${id}`);
  };

  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">
      
      {/* HEADER DA PÁGINA (Alinhado com o padrão de Colaboradores) */}
      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between w-full mb-4 md:mb-2 px-2 md:px-0">
          <button 
            onClick={() => navigate(-1)} 
            className="text-gray-800 hover:opacity-70 transition-opacity outline-none flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={window.innerWidth < 768 ? 24 : 32} />
          </button>
          
          <div className="text-center flex-grow">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Editar Funcionário</h2>
            <p className="text-[10px] md:text-sm text-gray-500 font-medium">
              Altere as informações cadastrais de {formData.name}.
            </p>
          </div>
          
          <div className="w-8 md:w-10 shrink-0"></div>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-5xl mx-auto w-full space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: IDENTIFICAÇÃO */}
          <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white flex flex-col">
            <div className="mb-6 flex justify-between items-center">
               <h3 className="text-[#B5071A] font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                 <ShieldCheck size={18} /> Identificação
               </h3>
               <select 
                 value={formData.status}
                 onChange={(e) => setFormData({...formData, status: e.target.value})}
                 className="text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-200 outline-none focus:border-[#B5071A]"
               >
                 <option value="Ativo">Ativo</option>
                 <option value="Inativo">Inativo</option>
               </select>
            </div>
            
            <div className="flex flex-col sm:flex-row-reverse gap-6 items-center">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-28 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                   {formData.avatarUrl ? (
                     <img src={formData.avatarUrl} className="w-full h-full object-cover opacity-60" />
                   ) : (
                     <UserCircle size={40} className="text-gray-300" />
                   )}
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      <span className="text-[8px] text-white font-bold uppercase">Trocar Foto</span>
                   </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Nome Completo</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Código</label>
                    <input 
                      type="text"
                      value={formData.code}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-400 outline-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Login</label>
                    <input 
                      type="text"
                      value={formData.login}
                      onChange={(e) => setFormData({...formData, login: e.target.value})}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: CONTATO */}
          <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
            <h3 className="text-[#B5071A] font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Mail size={18} /> Contato e Localização
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-3.5 text-gray-300" />
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full h-11 pl-12 pr-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Telefone / Ramal</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-3.5 text-gray-300" />
                  <input 
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-11 pl-12 pr-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: PROFISSIONAL */}
          <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white md:col-span-2">
            <h3 className="text-[#B5071A] font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Briefcase size={18} /> Informações Profissionais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Departamento</label>
                <select 
                   value={formData.department}
                   onChange={(e) => setFormData({...formData, department: e.target.value})}
                   className="h-11 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none appearance-none"
                >
                  <option value="Desenvolvimento">Desenvolvimento</option>
                  <option value="Suporte">Suporte</option>
                  <option value="RH">RH</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Cargo Atual</label>
                <input 
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Data de Admissão</label>
                <input 
                  type="date"
                  value={formData.hiringDate}
                  onChange={(e) => setFormData({...formData, hiringDate: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO (Estilo unificado) */}
        <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 pb-12">
          <button 
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#B5071A] text-white px-12 h-14 md:h-11 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            <Save size={18} /> SALVAR ALTERAÇÕES
          </button>
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 bg-[#1E293B] text-white px-12 h-14 md:h-11 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            <X size={18} /> CANCELAR
          </button>
        </div>
      </form>
    </div>
  );
}