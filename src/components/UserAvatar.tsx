interface UserProps {
  name: string;
}

export function UserAvatar({ name }: UserProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white font-ubuntu font-medium text-sm hidden lg:block uppercase">
        {name}
      </span>
      <div className="w-10 h-10 bg-[#D9D9D9] rounded-full border-2 border-white/20"></div>
    </div>
  );
}