import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Por favor, preencha todos os campos antes de continuar.");
      return;
    }
    navigate('/home'); 
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* HEADER: Ajustado para centralizar logo no mobile */}
      <header className="relative h-20 flex items-center justify-center md:justify-start px-6 md:px-10 overflow-hidden bg-white shadow-md z-20">
        <div className="z-10 shrink-0">
          <img 
            src={logo} 
            alt="Intellisys" 
            className="h-6 md:h-8 w-auto object-contain transition-all" 
            />
        </div>
        
        {/* Faixa Diagonal: Visível apenas em tablets e desktops */}
        <div className="absolute right-0 top-0 h-full w-[78%] bg-[#B5071A] diagonal-bg hidden md:block"></div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-10">
        {/* TEXTO DE BOAS-VINDAS: Fontes fluidas */}
        <div className="text-center mb-8 max-w-[90%]">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-montserrat">
            Acesse seu <span className="text-[#B5071A]">Perfil</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Acesse aqui seu perfil para conferir plantões e muito mais.
          </p>
        </div>

        {/* CARD DE LOGIN: Largura adaptável */}
        <div className="bg-gray-100 p-8 md:p-10 rounded-2xl shadow-sm w-full max-w-[450px]">
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input 
              label="Login" 
              placeholder="Digite seu email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input 
              label="Password" 
              isPassword 
              placeholder="Digite sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />  

            <div className="flex justify-center pt-2 w-full">
              {/* Envolvemos o Button em uma div com w-full e justify-center.
                Isso força o alinhamento central independente do breakpoint.
              */}
              <div className="flex justify-center">
                <Button label="Entrar" type="submit" />
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER: Texto menor em telas pequenas para evitar quebra de linha */}
      <footer className="bg-[#545454] text-white py-6 text-center text-[10px] md:text-sm tracking-wide px-4">
        Intellisys Informática Ltda / Todos os direitos reservados (c) 2026
      </footer>
    </div>
  );
}