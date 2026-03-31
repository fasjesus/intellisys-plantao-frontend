import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Calendar, ShieldCheck, 
  UserCircle, Briefcase, Save, X, Loader2, Lock 
} from 'lucide-react';
import { collaboratorService, type Collaborator } from '../../services/collaboratorService';

export function Edit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Estado de permissão

  const [formData, setFormData] = useState<Partial<Collaborator>>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    setor: '',
    status: 'ativo',
    data_admissao: '',
    //foto_url: ''
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        // --- TRAVA DE SEGURANÇA: APENAS ADMIN ---
        const savedUserRaw = localStorage.getItem('@Intellisys:user');
        if (!savedUserRaw || savedUserRaw === "undefined") {
          navigate('/');
          return;
        }

        const user = JSON.parse(savedUserRaw);
        const userIsAdmin = user?.role === 'admin' || user?.cargo === 'Administrador';
        
        if (!userIsAdmin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);

        // --- CARREGAMENTO DOS DADOS ---
        if (!id) return;
        const data = await collaboratorService.getById(id);
        setFormData({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cargo: data.cargo,
          setor: data.setor,
          status: data.status,
          data_admissao: data.data_admissao,
          //foto_url: data.foto_url
        });
      } catch (error) {
        console.error("Erro ao carregar colaborador:", error);
        alert("Erro ao carregar dados do servidor.");
        navigate('/users');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [id, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      await collaboratorService.update(id, formData);
      alert("Dados atualizados com sucesso!");
      navigate(`/users/details/${id}`);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Falha ao atualizar os dados no servidor.");
    } finally {
      setSaving(false);
    }
  };

  // 1. Loading inicial
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 size={40} className="text-[#B5071A] animate-spin" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest text-center">
          Validando permissões e acessando registro...
        </p>
      </div>
    );
  }

  // 2. Bloqueio se não for Admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <div className="bg-red-50 p-6 rounded-full">
          <Lock size={48} className="text-[#B5071A]" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Acesso Restrito</h2>
        <p className="text-gray-500 max-w-xs">
          Você não tem permissão para editar informações de colaboradores. 
          Contate o administrador do sistema.
        </p>
        <button 
          onClick={() => navigate('/home')}
          className="mt-4 bg-[#1E293B] text-white px-8 py-2 rounded-xl font-bold text-sm shadow-md"
        >
          VOLTAR PARA HOME
        </button>
      </div>
    );
  }

  // 3. Renderização do formulário (apenas se for admin e loading terminou)
  return (
    <div className="p-4 md:p-12 bg-white min-h-full font-inter flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col items-center mb-6 md:mb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between w-full mb-4 md:mb-2 px-2 md:px-0">
          <button onClick={() => navigate(-1)} className="text-gray-800 hover:opacity-70 outline-none">
            <ArrowLeft size={window.innerWidth < 768 ? 24 : 32} />
          </button>
          
          <div className="text-center flex-grow">
            <h2 className="text-xl md:text-2xl font-bold text-[#B5071A]">Editar Colaborador</h2>
            <p className="text-[10px] md:text-sm text-gray-500 font-medium truncate px-4">
              Privilégio de Administrador: Alterando {formData.nome}.
            </p>
          </div>
          
          <div className="w-8 md:w-10"></div>
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
                 onChange={(e) => setFormData({...formData, status: e.target.value as 'ativo' | 'inativo'})}
                 className="text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-200 outline-none focus:border-[#B5071A] cursor-pointer"
               >
                 <option value="ativo">Ativo</option>
                 <option value="inativo">Inativo</option>
               </select>
            </div>
            
            <div className="flex flex-col sm:flex-row-reverse gap-6 items-center">
              <div className="relative group cursor-pointer shrink-0">
                <div className="w-24 h-28 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                   {/* {formData.foto_url ? (
                     <img src={formData.foto_url} className="w-full h-full object-cover" alt="Avatar" />
                   ) : (
                     <UserCircle size={40} className="text-gray-200" />
                   )} */}
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Nome Completo</label>
                  <input 
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Código do Sistema</label>
                  <input 
                    type="text"
                    value={id?.split('-')[0].toUpperCase()}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-400 outline-none cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: CONTATO */}
          <div className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
            <h3 className="text-[#B5071A] font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Mail size={18} /> Contato Corporativo
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-3.5 text-gray-300" />
                  <input 
                    type="email"
                    required
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
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
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
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Setor</label>
                <input 
                  type="text"
                  value={formData.setor}
                  onChange={(e) => setFormData({...formData, setor: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Cargo</label>
                <input 
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 flex items-center gap-1">
                  <Calendar size={12} /> Data de Admissão
                </label>
                <input 
                  type="text"
                  value={formData.data_admissao}
                  onChange={(e) => setFormData({...formData, data_admissao: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:border-[#B5071A] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 pb-12">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#B5071A] text-white px-12 h-12 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button 
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#1E293B] text-white px-12 h-12 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all"
          >
            <X size={18} /> Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}