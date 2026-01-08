
import React, { useState, useEffect, useCallback } from 'react';
import { getMedicamentos, registrarMovimentacao } from '../services/api';
import { Medicamento, TipoMovimentacao, MovimentacaoEstoqueRequest } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FaWarehouse, FaArrowCircleRight } from 'react-icons/fa';

// Esta é a nova página para controle de estoque.
// Ela lista os medicamentos e permite a movimentação do estoque de cada um.

// Um objeto para mapear os tipos de movimentação para textos amigáveis.
// CORREÇÃO: Limitamos as opções para as que temos endpoints confirmados (ENTRADA, SAIDA)
// para evitar que o usuário selecione uma opção não suportada pela API.
const tipoMovimentacaoLabels: Record<string, string> = {
    [TipoMovimentacao.ENTRADA]: 'Entrada',
    [TipoMovimentacao.SAIDA]: 'Saída',
    // [TipoMovimentacao.AJUSTE]: 'Ajuste', // Temporariamente removido
    // [TipoMovimentacao.PERDA]: 'Perda', // Temporariamente removido
    // [TipoMovimentacao.VENDA]: 'Venda (Manual)', // Temporariamente removido
};

const Estoque: React.FC = () => {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Estado para o formulário de movimentação
    const [movimentacaoAtual, setMovimentacaoAtual] = useState<Partial<MovimentacaoEstoqueRequest> & { medicamentoNome?: string; estoqueAtual?: number } | null>(null);

    const carregarMedicamentos = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMedicamentos();
            setMedicamentos(data);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar o estoque.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarMedicamentos();
    }, [carregarMedicamentos]);

    const abrirModal = (medicamento: Medicamento) => {
        setMovimentacaoAtual({
            medicamentoId: medicamento.id,
            medicamentoNome: medicamento.nome,
            estoqueAtual: medicamento.quantidade,
            tipo: TipoMovimentacao.ENTRADA, // Valor padrão
            quantidade: 1,
            motivo: '',
            observacao: '',
        });
        setIsModalOpen(true);
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setMovimentacaoAtual(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!movimentacaoAtual || !movimentacaoAtual.medicamentoId || !movimentacaoAtual.tipo || !movimentacaoAtual.quantidade) {
            setError("Todos os campos são obrigatórios.");
            return;
        }

        if (movimentacaoAtual.quantidade <= 0) {
            setError("A quantidade deve ser maior que zero.");
            return;
        }

        const dataToSend: MovimentacaoEstoqueRequest = {
            medicamentoId: movimentacaoAtual.medicamentoId,
            tipo: movimentacaoAtual.tipo,
            quantidade: movimentacaoAtual.quantidade,
            motivo: movimentacaoAtual.motivo,
            observacao: movimentacaoAtual.observacao,
        };

        try {
            await registrarMovimentacao(dataToSend);
            fecharModal();
            carregarMedicamentos(); // Recarrega os dados para ver o estoque atualizado.
        } catch (err) {
            const apiError = err as Error;
            setError(apiError.message || 'Falha ao registrar a movimentação.');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><FaWarehouse className="mr-3" />Controle de Estoque</h1>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
            
            {isLoading ? <p>Carregando...</p> : (
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicamento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {medicamentos.map(med => (
                                    <tr key={med.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.categoria.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-800">{med.quantidade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <Button onClick={() => abrirModal(med)} variant="secondary" icon={<FaArrowCircleRight />}>
                                                Movimentar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={fecharModal} title={`Movimentar Estoque: ${movimentacaoAtual?.medicamentoNome}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600">Estoque atual: <span className="font-bold">{movimentacaoAtual?.estoqueAtual}</span> unidades.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Movimentação</label>
                        <select 
                            value={movimentacaoAtual?.tipo || ''} 
                            onChange={e => setMovimentacaoAtual({...movimentacaoAtual, tipo: e.target.value as TipoMovimentacao})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        >
                            {Object.entries(tipoMovimentacaoLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                        <input 
                            type="number" 
                            value={movimentacaoAtual?.quantidade || 1} 
                            onChange={e => setMovimentacaoAtual({...movimentacaoAtual, quantidade: parseInt(e.target.value, 10)})} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                            min="1"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Motivo (Opcional para Entradas)</label>
                        <input
                            type="text"
                            value={movimentacaoAtual?.motivo || ''}
                            onChange={e => setMovimentacaoAtual({...movimentacaoAtual, motivo: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Observação (Opcional)</label>
                        <textarea 
                            value={movimentacaoAtual?.observacao || ''} 
                            onChange={e => setMovimentacaoAtual({...movimentacaoAtual, observacao: e.target.value})} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            rows={2}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={fecharModal}>Cancelar</Button>
                        <Button type="submit">Confirmar Movimentação</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Estoque;