
import React from 'react';

// Criar componentes de UI genéricos como este Card é uma excelente prática.
// Ele nos permite reutilizar o mesmo estilo e estrutura em vários lugares,
// mantendo a consistência visual e reduzindo a duplicação de código.

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string; // ex: 'bg-blue-500'
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center transform hover:-translate-y-1 transition-transform duration-300">
      <div className={`p-4 rounded-xl text-white ${color} mr-4 text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default Card;
   