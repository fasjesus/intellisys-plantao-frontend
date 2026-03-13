import perfilImg from '../assets/images/avatar_login.png'; 

interface UserAvatarProps {
  name?: string;
}

export function UserAvatar({ name }: UserAvatarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Container do Avatar */}
      <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white/20 overflow-hidden shrink-0 shadow-sm">
        <img 
          src={perfilImg} 
          alt="Foto de perfil" 
          className="h-full w-full object-cover" 
        />
      </div>

      {/* Nome: Oculto no mobile se o nome for string vazia, visível no desktop */}
      {name && (
        <span className="hidden md:block text-white font-bold text-sm tracking-wide">
          {name}
        </span>
      )}
    </div>
  );
}