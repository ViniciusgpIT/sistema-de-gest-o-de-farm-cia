
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../services/api';

// Olá! Este é o nosso Contexto de Autenticação.
// Usar um Contexto é a forma moderna e recomendada no React para compartilhar
// um estado global (como o status de login) entre componentes distantes na árvore.

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<void>;
  logout: () => void;
}

// Criamos o contexto com um valor padrão.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Este é o provedor do nosso contexto. Ele vai "envolver" nossa aplicação
// e fornecer os valores e funções de autenticação para todos os componentes filhos.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Ao iniciar, verificamos se já existe um token no localStorage para manter o usuário logado.
    return !!localStorage.getItem('authToken');
  });
  const navigate = useNavigate();

  // Função de login
  const login = async (user: string, pass: string) => {
    try {
      // Usamos a função da nossa API para validar as credenciais.
      const authToken = await loginRequest(user, pass);
      // Se a validação for bem-sucedida, salvamos o token no localStorage.
      localStorage.setItem('authToken', authToken);
      setIsAuthenticated(true);
      // E navegamos para a página principal.
      navigate('/');
    } catch (error) {
      console.error("Falha no login:", error);
      // Se falhar, limpamos qualquer resquício de token e lançamos o erro para a página de Login tratar.
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    // Ao deslogar, enviamos o usuário de volta para a tela de login.
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do nosso contexto.
// Em vez de importar useContext e AuthContext em cada componente,
// podemos simplesmente usar `const { login } = useAuth();`
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
