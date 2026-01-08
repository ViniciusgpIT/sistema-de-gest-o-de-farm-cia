
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

// Olá! Esta é a nossa nova página de Login.
// Ela é a porta de entrada para o sistema.

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Usamos nosso hook customizado para acessar a função de login.
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            // Tentamos fazer o login com as credenciais fornecidas.
            await login(username, password);
            // Se o login for bem-sucedido, o AuthContext irá nos redirecionar.
            // Mas podemos garantir a navegação para a página principal aqui.
            navigate('/');
        } catch (err) {
            // Se o login falhar, exibimos uma mensagem de erro.
            setError('Usuário ou senha inválidos. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-2xl rounded-2xl">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="text-4xl text-blue-600 mr-3" />
                        <h1 className="text-3xl font-bold tracking-wider text-gray-800">Farmácia+</h1>
                    </div>
                    <h2 className="text-xl text-gray-600">Acesse sua conta</h2>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuário</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    {error && (
                        <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
                    )}

                    <div>
                        <Button type="submit" disabled={isLoading} icon={<FaSignInAlt />}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
