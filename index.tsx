
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Seleciona o elemento root do HTML.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Elemento root não encontrado para montar a aplicação.");
}

// Cria a raiz da aplicação React 18.
const root = ReactDOM.createRoot(rootElement);

// Renderiza o componente principal App dentro do StrictMode para verificações adicionais.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
   