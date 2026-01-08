
import React, { useState, useEffect, useCallback } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/api';
import { Cliente } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// Como mencionei, a estrutura desta página é muito similar à de Medicamentos.
// Isso é ótimo, pois demonstra como a componentização nos ajuda a sermos mais produtivos.
// A lógica principal de CRUD é a mesma, só mudam os dados e os campos do formulário.

// ATUALIZAÇÃO: Criei esta função para formatar o CPF na exibição.
// Ela limpa qualquer caractere que não seja número e aplica a máscara padrão.
// É uma boa prática manter a formatação no frontend, sem alterar o dado original que vem da API.
const formatarCPF = (cpf: string): string => {
    if (!cpf) return '';
    // 1. Remove tudo que não for dígito.
    const cpfLimpo = cpf.replace(/\D/g, '');
  
    // 2. Se não tiver 11 dígitos, retorna o valor original para não formatar errado.
    if (cpfLimpo.length !== 11) {
      return cpf;
    }
  
    // 3. Aplica a máscara XXX.XXX.XXX-XX
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};


const Clientes: React.FC = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clienteAtual, setClienteAtual] = useState<Partial<Cliente> | null>(null);

    const carregarClientes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getClientes();
            setClientes(data);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar clientes.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarClientes();
    }, [carregarClientes]);

    const abrirModal = (cliente: Partial<Cliente> | null = null) => {
        setClienteAtual(cliente ? { ...cliente } : {});
        setIsModalOpen(true);
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setClienteAtual(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!clienteAtual || !clienteAtual.nome || !clienteAtual.cpf || !clienteAtual.email || !clienteAtual.dataNascimento) {
            setError("Todos os campos são obrigatórios.");
            return;
        }

        const dataToSend: Omit<Cliente, 'id'> = {
            nome: clienteAtual.nome,
            cpf: clienteAtual.cpf,
            email: clienteAtual.email,
            dataNascimento: clienteAtual.dataNascimento,
            totalCompras: clienteAtual.totalCompras
        };

        try {
            if (clienteAtual.id) {
                await updateCliente(clienteAtual.id, dataToSend);
            } else {
                await createCliente(dataToSend);
            }
            fecharModal();
            carregarClientes();
        } catch (err) {
            console.error(err);
            setError('Falha ao salvar o cliente.');
        }
    };
    
    const handleExcluir = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await deleteCliente(id);
                carregarClientes();
            } catch (err) {
                console.error(err);
                setError('Falha ao excluir o cliente.');
            }
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciar Clientes</h1>
                <Button onClick={() => abrirModal()} icon={<FaPlus />}>
                    Novo Cliente
                </Button>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
            
            {isLoading ? <p>Carregando...</p> : (
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clientes.map(cli => (
                                    <tr key={cli.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cli.nome}</td>
                                        {/* ATUALIZAÇÃO: Aplicamos a função de formatação aqui */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarCPF(cli.cpf)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cli.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => abrirModal(cli)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                                            <button onClick={() => handleExcluir(cli.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={fecharModal} title={clienteAtual?.id ? 'Editar Cliente' : 'Novo Cliente'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" value={clienteAtual?.nome || ''} onChange={e => setClienteAtual({...clienteAtual, nome: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF</label>
                        <input type="text" value={clienteAtual?.cpf || ''} onChange={e => setClienteAtual({...clienteAtual, cpf: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={clienteAtual?.email || ''} onChange={e => setClienteAtual({...clienteAtual, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                        <input type="date" value={clienteAtual?.dataNascimento || ''} onChange={e => setClienteAtual({...clienteAtual, dataNascimento: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={fecharModal}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

export default Clientes;