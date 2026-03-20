import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Month } from './pages/Scale/Month';
import { Year } from './pages/Scale/Year';
import { All as UsersAll } from './pages/Users/All';
import { Details } from './pages/Users/Details';
import { Reports } from './pages/Reports';

export function App() {
  return (
    <Routes>
      {/* Telas sem Sidebar/Header padrão */}
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />

      {/* Telas com AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/scale/month" element={<Month />} />
        <Route path="/scale/year" element={<Year />} />
        <Route path="/users" element={<UsersAll />} />
        <Route path="/users/details/:id" element={<Details />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Rota de erro 404 */}
      <Route path="*" element={<div className="p-10 font-bold">Página não encontrada</div>} />
    </Routes>
  );
}