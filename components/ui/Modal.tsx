
import React from 'react';
import { FaTimes } from 'react-icons/fa';

// Um bom componente de Modal é essencial para uma boa UX em formulários.
// Este é projetado para ser genérico: ele não sabe qual formulário está dentro dele,
// apenas como se exibir e se fechar. O conteúdo é passado via 'children'.

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Overlay que cobre a tela inteira. Clicar nele fecha o modal.
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Conteúdo do modal. Usamos e.stopPropagation() para que o clique dentro dele não feche o modal. */}
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
