
import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Medicamentos from './pages/Medicamentos';
import Clientes from './pages/Clientes';
import Categorias from './pages/Categorias';
import Vendas from './pages/Vendas';
import Estoque from './pages/Estoque';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Olá, colega! Refatorei o App.tsx para ser o ponto de entrada da nossa lógica de rotas,
// agora com controle de autenticação e responsividade.

// ATUALIZAÇÃO: O layout principal agora recebe o estado do sidebar e a função para controlá-lo.
const MainLayout = ({ isSidebarOpen, toggleSidebar }: { isSidebarOpen: boolean, toggleSidebar: () => void }) => (
  <div className="flex h-screen bg-gray-100">
    <Sidebar isOpen={isSidebarOpen} />
    
    {/* Overlay para fechar o sidebar em telas pequenas */}
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
      onClick={toggleSidebar}
    ></div>

    {/* 
      MANUTENÇÃO: A classe `lg:ml-0` está fixa conforme solicitado.
      Isso desativa o ajuste de margem do conteúdo principal quando a sidebar é aberta em telas grandes.
      O comportamento dinâmico anterior era: ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
    */}
    <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out lg:ml-0`}>
      <Header toggleSidebar={toggleSidebar} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 md:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/medicamentos" element={<Medicamentos />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/vendas" element={<Vendas />} />
        </Routes>
      </main>
    </div>
  </div>
);

function App() {
  // ATUALIZAÇÃO: Adicionamos o estado para controlar o sidebar.
  // Começa aberto por padrão em telas maiores.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    // CORREÇÃO: O <HashRouter> deve envolver o <AuthProvider>.
    // O hook useNavigate, usado dentro do AuthProvider, precisa do contexto
    // que o HashRouter fornece. Essa troca corrige o erro de inicialização.
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* A rota de login é pública. */}
          <Route path="/login" element={<Login />} />
          
          {/* Todas as outras rotas são protegidas. O ProtectedRoute vai verificar
              se o usuário está logado antes de renderizar o MainLayout. */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                {/* ATUALIZAÇÃO: Passamos o estado e a função de toggle para o layout */}
                <MainLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;