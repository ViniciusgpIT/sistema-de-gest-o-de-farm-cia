
import React, { useState, useEffect, useCallback } from 'react';
import { getMedicamentos, createMedicamento, updateMedicamento, deleteMedicamento, updateStatusMedicamento, getCategorias } from '../services/api';
import { Medicamento, Categoria, StatusMedicamento } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

// Esta página é um CRUD (Create, Read, Update, Delete) completo para Medicamentos.
// É um padrão muito comum em sistemas de gestão. A lógica aqui pode ser reaproveitada
// para Clientes e Categorias.

const Medicamentos: React.FC = () => {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [medicamentoAtual, setMedicamentoAtual] = useState<Partial<Medicamento> | null>(null);

    // Função para carregar os dados da API.
    // Usamos useCallback para memorizar a função e evitar recriações desnecessárias.
    const carregarDados = useCallback(async () => {
        setIsLoading(true);
        try {
            const [medicamentosData, categoriasData] = await Promise.all([getMedicamentos(), getCategorias()]);
            setMedicamentos(medicamentosData);
            setCategorias(categoriasData);
            setError(null);
        } catch (err) {
            const apiError = err as Error;
            setError(apiError.message || 'Falha ao carregar medicamentos.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // useEffect para chamar a função de carregamento na montagem do componente.
    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const abrirModal = (medicamento: Partial<Medicamento> | null = null) => {
        setMedicamentoAtual(medicamento ? { ...medicamento } : {});
        setIsModalOpen(true);
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setMedicamentoAtual(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!medicamentoAtual) return;

        // Montamos o DTO (Data Transfer Object) esperado pela API.
        // A API espera 'categoriaId', e não o objeto Categoria inteiro.
        const dadosParaApi = {
            ...medicamentoAtual,
            categoriaId: (medicamentoAtual.categoria as any)?.id || medicamentoAtual.categoria
        };
        delete dadosParaApi.categoria;

        try {
            if (medicamentoAtual.id) {
                await updateMedicamento(medicamentoAtual.id, dadosParaApi);
            } else {
                await createMedicamento(dadosParaApi);
            }
            fecharModal();
            carregarDados(); // Recarrega os dados após a operação.
        } catch (err) {
            const apiError = err as Error;
            setError(apiError.message || 'Falha ao salvar o medicamento.');
            console.error(err);
        }
    };
    
    const handleExcluir = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este medicamento?')) {
            try {
                await deleteMedicamento(id);
                carregarDados();
            } catch (err) {
                const apiError = err as Error;
                setError(apiError.message ||'Falha ao excluir o medicamento.');
                console.error(err);
            }
        }
    };

    // CORREÇÃO: A função agora recebe o status atual (que é uma string do enum)
    // e calcula o novo status com base nele.
    const handleMudarStatus = async (id: number, statusAtual: StatusMedicamento) => {
        const novoStatus = statusAtual === StatusMedicamento.ATIVO ? StatusMedicamento.INATIVO : StatusMedicamento.ATIVO;
        try {
            await updateStatusMedicamento(id, novoStatus);
            carregarDados();
        } catch (err) {
            const apiError = err as Error;
            setError(apiError.message || 'Falha ao alterar o status do medicamento.');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciar Medicamentos</h1>
                <Button onClick={() => abrirModal()} icon={<FaPlus />}>
                    Novo Medicamento
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {medicamentos.map(med => {
                                    // CORREÇÃO: Criamos uma variável para facilitar a leitura da condição.
                                    const isAtivo = med.status === StatusMedicamento.ATIVO;
                                    return (
                                    <tr key={med.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.categoria.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.quantidade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {/* CORREÇÃO: A lógica de classe e texto agora usa a variável 'isAtivo' */}
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isAtivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {isAtivo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {/* CORREÇÃO: O onClick agora passa 'med.status' para a função. */}
                                            <button onClick={() => handleMudarStatus(med.id, med.status)} className={`text-xl ${isAtivo ? 'text-green-500' : 'text-red-500'}`} title={isAtivo ? 'Inativar' : 'Ativar'}>
                                                {isAtivo ? <FaToggleOn /> : <FaToggleOff />}
                                            </button>
                                            <button onClick={() => abrirModal(med)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                                            <button onClick={() => handleExcluir(med.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={fecharModal} title={medicamentoAtual?.id ? 'Editar Medicamento' : 'Novo Medicamento'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" value={medicamentoAtual?.nome || ''} onChange={e => setMedicamentoAtual({...medicamentoAtual, nome: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea value={medicamentoAtual?.descricao || ''} onChange={e => setMedicamentoAtual({...medicamentoAtual, descricao: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preço</label>
                        <input type="number" step="0.01" value={medicamentoAtual?.preco || ''} onChange={e => setMedicamentoAtual({...medicamentoAtual, preco: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                        <input type="number" value={medicamentoAtual?.quantidade || ''} onChange={e => setMedicamentoAtual({...medicamentoAtual, quantidade: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Validade</label>
                        <input type="date" value={medicamentoAtual?.dataValidade || ''} onChange={e => setMedicamentoAtual({...medicamentoAtual, dataValidade: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select
                            value={medicamentoAtual?.categoria?.id || ''}
                            onChange={e => setMedicamentoAtual({ ...medicamentoAtual, categoria: { id: parseInt(e.target.value) } as Categoria })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                        </select>
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

export default Medicamentos;