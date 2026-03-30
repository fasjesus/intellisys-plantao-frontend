import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';

export function Login() {
  const navigate = useNavigate();
  
  // Estados para os campos e controle de interface
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos antes de continuar.");
      return;
    }

    setLoading(true);

    try {

      await authService.login({ 
        email: email.trim(), 
        senha: password 
      });

      navigate('/home'); 
    } catch (err: any) {
      console.error("Erro na autenticação:", err);

      const apiErrorMessage = err.response?.data?.message || "E-mail ou senha incorretos. Tente novamente.";
      setError(apiErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* HEADER DA INTELLISYS */}
      <header className="relative h-18 md:h-20 flex items-center justify-between px-6 md:px-10 bg-white shadow-md z-30">
        <div className="z-10 shrink-0">
          <img src={logo} alt="Intellisys" className="h-6 md:h-8 w-auto object-contain" />
        </div>
        
        {/* Faixas Diagonais Visuais */}
        <div className="absolute right-0 top-0 h-full w-[78%] bg-[#B5071A] diagonal-bg hidden md:block"></div>
        <div className="absolute right-0 top-0 h-full w-[40%] bg-[#B5071A] diagonal-bg flex md:hidden items-center justify-end px-4 gap-4"></div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-10">
        {/* TÍTULO E BOAS-VINDAS */}
        <div className="text-center mb-8 max-w-[90%]">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-montserrat">
            Acesse seu <span className="text-[#B5071A]">Perfil</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Acesse aqui seu perfil para conferir plantões e muito mais.
          </p>
        </div>

        {/* CARD DE LOGIN */}
        <div className="bg-gray-100 p-8 md:p-10 rounded-2xl shadow-sm w-full max-w-[450px]">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Exibição de erro caso a API falhe */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-[#B5071A] text-xs p-3 rounded-lg font-bold text-center animate-pulse">
                {error}
              </div>
            )}

            <Input 
              label="E-mail" 
              placeholder="Digite seu email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <div className="flex flex-col gap-1">
              <Input 
                label="Senha" 
                isPassword 
                placeholder="Digite sua senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />  

              <div className="flex justify-end pr-1 mt-1">
                <button 
                  type="button"
                  onClick={() => navigate('/recovery')} 
                  className="text-[10px] md:text-xs text-gray-400 hover:text-[#B5071A] transition-colors font-medium underline-offset-4 hover:underline"
                >
                  Esqueceu sua senha? <span className="font-bold">Clique aqui</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-2 w-full">
              <div className="w-full flex justify-center">
                <Button 
                  label={loading ? "Autenticando..." : "Entrar"} 
                  type="submit" 
                  disabled={loading}
                />
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER INTELLISYS */}
      <footer className="bg-[#545454] text-white py-6 text-center text-[10px] md:text-sm tracking-wide px-4">
        Intellisys Informática Ltda / Todos os direitos reservados (c) 2026
      </footer>
    </div>
  );
}