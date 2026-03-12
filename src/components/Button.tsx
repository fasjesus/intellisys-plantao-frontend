interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function Button({ label, ...props }: ButtonProps) {
  return (
    <button 
      {...props}
      className="bg-intellisys-red text-white px-12 py-2.5 rounded-xl font-bold font-inter hover:opacity-90 transition-all active:scale-95 shadow-md"
    >
      {label}
    </button>
  );
}