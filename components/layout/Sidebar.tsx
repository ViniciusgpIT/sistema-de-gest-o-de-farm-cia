
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaCapsules, FaUsers, FaTags, FaShoppingCart, FaExclamationTriangle, FaWarehouse } from 'react-icons/fa';

// Este é o nosso componente de navegação. Ele é responsável por nos levar
// para as diferentes seções da aplicação.
// ATUALIZAÇÃO: Agora ele é responsivo e pode ser ocultado.

const navItems = [
  { to: '/', text: 'Dashboard', icon: <FaTachometerAlt /> },
  { to: '/medicamentos', text: 'Medicamentos', icon: <FaCapsules /> },
  { to: '/estoque', text: 'Estoque', icon: <FaWarehouse /> },
  { to: '/clientes', text: 'Clientes', icon: <FaUsers /> },
  { to: '/categorias', text: 'Categorias', icon: <FaTags /> },
  { to: '/vendas', text: 'Vendas', icon: <FaShoppingCart /> },
];

const NavItem = ({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) => {
  const baseClasses = "flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200";
  const activeClasses = "bg-blue-600 text-white shadow-lg";

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ''}`}
    >
      <span className="text-lg mr-3">{icon}</span>
      <span>{text}</span>
    </NavLink>
  );
};

// ATUALIZAÇÃO: O Sidebar agora recebe a prop 'isOpen' para controlar sua visibilidade.
function Sidebar({ isOpen }: { isOpen: boolean }) {
  return (
    // ATUALIZAÇÃO DE CLASSE:
    // - Em telas pequenas (padrão): `fixed` e usa `transform` para deslizar para dentro/fora da tela.
    // - Em telas grandes (`lg:`): `relative` para empurrar o conteúdo e controla a largura (`w-64` ou `w-0`).
    // - As transições garantem a suavidade da animação.
    <aside className={`
      fixed inset-y-0 left-0 bg-gray-800 text-white flex-shrink-0 flex flex-col p-4
      transform transition-all duration-300 ease-in-out z-30
      lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:w-0 lg:p-0'}
    `}>
       {/* Adicionamos um wrapper para o conteúdo para controlar o overflow e a opacidade durante a transição */}
      <div className={`overflow-hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-center mb-8 border-b border-gray-700 pb-4">
          <FaExclamationTriangle className="text-3xl text-blue-400 mr-2" />
          <h1 className="text-2xl font-bold tracking-wider">Farmácia+</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon} text={item.text} />
          ))}
        </nav>
        <div className="mt-auto text-center text-gray-500 text-xs">
          <p>&copy; 2026 Gestão Farmácia</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;