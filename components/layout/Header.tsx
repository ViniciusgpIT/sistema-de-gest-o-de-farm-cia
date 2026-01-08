
import React from 'react';
import { FaSignOutAlt, FaBars } from 'react-icons/fa'; // ATUALIZAÇÃO: Importamos o ícone de menu
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

// O Header é a barra superior da nossa aplicação.
// ATUALIZAÇÃO: Agora ele contém o botão para abrir/fechar o sidebar.

// ATUALIZAÇÃO: O Header agora espera a função toggleSidebar via props.
function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
      <div className="flex items-center">
        {/* ATUALIZAÇÃO: Adicionamos o botão de menu (hambúrguer) */}
        {/* Ele chama a função que veio do componente pai (App.tsx) */}
        <button 
          onClick={toggleSidebar} 
          className="text-gray-600 hover:text-gray-800 focus:outline-none mr-4"
          aria-label="Abrir ou fechar menu"
        >
          <FaBars size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-700 sm:block">Bem-vindo ao Sistema</h2>
      </div>
      <div className="flex items-center">
        <Button onClick={logout} variant="secondary" icon={<FaSignOutAlt />}>
            Sair
        </Button>
      </div>
    </header>
  );
}

export default Header;