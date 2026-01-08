// CORREÇÃO: Olá! O erro "Cannot find namespace 'JSX'" acontece porque o TypeScript
// não sabe o que é `JSX.Element` sem que o React esteja importado no arquivo.
// Adicionar o `import React from 'react';` no topo resolve isso, pois ele traz todas as
// definições de tipo necessárias para o JSX funcionar corretamente.
import React, { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Este é um componente de ordem superior (Higher-Order Component) que protege nossas rotas.
// Ele verifica se o usuário está autenticado antes de renderizar a página solicitada.

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Pegamos o estado de autenticação do nosso contexto.
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Se o usuário não estiver autenticado, nós o redirecionamos para a página de login.
    // O `state: { from: location }` é um truque útil para que, após o login,
    // possamos redirecionar o usuário de volta para a página que ele tentou acessar.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário estiver autenticado, renderizamos o componente filho (a página solicitada).
  return children;
};

export default ProtectedRoute;
