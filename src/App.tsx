import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Month } from './pages/Scale/Month';
import { Suggestion } from './pages/Scale/Suggestion';
import { All as UsersAll } from './pages/Users/All';
import { Details } from './pages/Users/Details';
import { Reports } from './pages/Reports';
import { Duty } from './pages/Duty';
import { Edit } from './pages/Users/Edit';
import { Create } from './pages/Users/Create';
import { ModeloComunicacao } from './pages/ModeloComunicacao';
import { Cadastro } from './pages/Cadastro';
import { Permissions } from './pages/Users/Permissions';
import { ReportPrint } from './pages/ReportPrint';

export function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      {/* Telas sem Sidebar/Header padrão */}
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/home" element={<Home />} />
      <Route path="/reports/print" element={<ReportPrint />} />

      {/* Telas com AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/scale/month" element={<Month />} />
        <Route path="/scale/suggestion" element={<Suggestion />} />
        <Route path="/users" element={<UsersAll />} />
        <Route path="/users/permissions" element={<Permissions />} />
        <Route path="/users/details/:id" element={<Details />} />
        <Route path="/users/edit/:id" element={<Edit />} />
        <Route path="/users/create" element={<Create />} />
        <Route path="/modelo-comunicacao" element={<ModeloComunicacao />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/duty" element={<Duty />} />
      </Route>

      {/* Rota de erro 404 */}
      <Route path="*" element={<div className="p-10 font-bold">Página não encontrada</div>} />
    </Routes>
    </AnimatePresence>
  );
}