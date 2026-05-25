import { Navigate } from 'react-router-dom';

function getRole(): string {
  try {
    const raw = localStorage.getItem('@Intellisys:user');
    if (!raw) return '';
    return JSON.parse(raw)?.role?.toLowerCase() ?? '';
  } catch {
    return '';
  }
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const role = getRole();
  if (role !== 'admin' && role !== 'gerente') {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}
