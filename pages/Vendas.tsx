
import React, { useState, useEffect, useCallback } from 'react';
import { getVendas, createVenda, getClientes, getMedicamentos } from '../services/api';
// CORREÇÃO: Precisamos do enum 'StatusMedicamento' para fazer a verificação correta do status do medicamento.
import { Venda, Cliente, Medicamento, StatusMedicamento } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FaPlus, FaShoppingCart, FaTrash, FaEye } from 'react-icons/fa';

// A tela de Vendas é um pouco mais complexa, pois envolve múltiplos conceitos:
// clientes, medicamentos e os itens da venda.
// O formulário de nova venda é um bom exemplo de como gerenciar um estado mais complexo no React.

interface ItemVendaForm {
    medicamentoId: number;
    quantidade: number;
    precoUnitario: number;
    nomeMedicamento?: string;
}

const Vendas: React.FC = () => {
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Estados para o modal de detalhes
    const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
    const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);

    // ATUALIZAÇÃO: Criei um estado de erro específico para o modal.
    // Isso garante que os erros do formulário apareçam dentro do modal, e não atrás dele.
    const [modalError, setModalError] = useState<string | null>(null);


    // Estado para o formulário da nova venda
    const [novaVenda, setNovaVenda] = useState<{ clienteId: number | null, itens: ItemVendaForm[] }>({
        clienteId: null,
        itens: [],
    });

    const carregarDados = useCallback(async () => {
        setIsLoading(true);
        try {
            const [vendasData, clientesData, medicamentosData] = await Promise.all([getVendas(), getClientes(), getMedicamentos()]);
            setVendas(vendasData);

            // Olá! Atendendo ao seu pedido, agora filtramos a lista de clientes.
            // Apenas clientes marcados como 'maiorDeIdade' pela API serão exibidos no dropdown.
            // Isso previne o erro de venda para menores de idade antes mesmo que ele aconteça. Ótima ideia!
            setClientes(clientesData.filter(cliente => cliente.maiorDeIdade));
            
            // CORREÇÃO: Olá! O tipo Medicamento foi atualizado e agora usa 'status' em vez de 'ativo'.
            // Ajustei o filtro para usar 'm.status === StatusMedicamento.ATIVO' para mostrar apenas os medicamentos ativos e com estoque para venda.
            setMedicamentos(medicamentosData.filter(m => m.status === StatusMedicamento.ATIVO && m.quantidade > 0));
            setError(null);
        } catch (err) {
            const apiError = err as Error;
            setError(apiError.message || 'Falha ao carregar dados de vendas.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const abrirModal = () => {
        // ATUALIZAÇÃO: Resetamos o erro do modal toda vez que ele é aberto.
        setModalError(null);
        setNovaVenda({ clienteId: null, itens: [] });
        setIsModalOpen(true);
    };

    const fecharModal = () => setIsModalOpen(false);

    // Funções para o modal de detalhes
    const abrirDetalhesModal = (venda: Venda) => {
        setVendaSelecionada(venda);
        setIsDetalhesModalOpen(true);
    };
    
    const fecharDetalhesModal = () => {
        setIsDetalhesModalOpen(false);
        setVendaSelecionada(null);
    };

    const handleAddItem = () => {
        const primeiroMedicamento = medicamentos[0];
        if (!primeiroMedicamento) return;
        setNovaVenda(prev => ({
            ...prev,
            itens: [...prev.itens, { medicamentoId: primeiroMedicamento.id, quantidade: 1, precoUnitario: primeiroMedicamento.preco }]
        }));
    };

    const handleItemChange = (index: number, field: keyof ItemVendaForm, value: string | number) => {
        const novosItens = [...novaVenda.itens];
        (novosItens[index] as any)[field] = value;
        
        // Se mudou o medicamento, atualiza o preço unitário.
        if (field === 'medicamentoId') {
            const med = medicamentos.find(m => m.id === Number(value));
            if (med) {
                novosItens[index].precoUnitario = med.preco;
                novosItens[index].nomeMedicamento = med.nome;
            }
        }

        setNovaVenda(prev => ({ ...prev, itens: novosItens }));
    };

    const handleRemoveItem = (index: number) => {
        setNovaVenda(prev => ({
            ...prev,
            itens: prev.itens.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setModalError(null);

        if (!novaVenda.clienteId || novaVenda.itens.length === 0) {
            setModalError("Selecione um cliente e adicione pelo menos um item.");
            return;
        }

        // ATUALIZAÇÃO: Lógica para consolidar itens duplicados antes de finalizar a venda.
        // Usamos um Map para agrupar os itens pelo ID do medicamento de forma eficiente.
        const itensMap = new Map<number, ItemVendaForm>();

        for (const item of novaVenda.itens) {
            if (itensMap.has(item.medicamentoId)) {
                // Se o item já existe no mapa, apenas somamos a quantidade.
                const itemExistente = itensMap.get(item.medicamentoId)!;
                itemExistente.quantidade += item.quantidade;
            } else {
                // Se for a primeira vez, adicionamos uma cópia do item ao mapa.
                itensMap.set(item.medicamentoId, { ...item });
            }
        }
        // Convertemos os valores do mapa de volta para um array de itens consolidados.
        const itensConsolidados = Array.from(itensMap.values());

        const dataToSend = {
            clienteId: novaVenda.clienteId,
            // ATUALIZAÇÃO: Agora usamos a lista de itens consolidados para enviar à API.
            itens: itensConsolidados.map(({ medicamentoId, quantidade, precoUnitario }) => ({
                medicamentoId,
                quantidade,
                precoUnitario
            }))
        };

        try {
            await createVenda(dataToSend);
            fecharModal();
            carregarDados();
        } catch (err) {
            const apiError = err as Error;
            let displayError = 'Falha ao registrar a venda. Verifique os dados e o estoque.';
            if (apiError.message) {
                try {
                    const errorObj = JSON.parse(apiError.message);
                    displayError = errorObj.message || apiError.message;
                } catch (e) {
                    displayError = apiError.message;
                }
            }
            setModalError(displayError);
            console.error(err);
        }
    };
    
    const valorTotalVenda = novaVenda.itens.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Histórico de Vendas</h1>
                <Button onClick={abrirModal} icon={<FaPlus />}>
                    Registrar Venda
                </Button>
            </div>

            {/* Este erro agora é apenas para falhas no carregamento inicial da página */}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
            
            {isLoading ? <p>Carregando...</p> : (
                 <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venda</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vendas.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{v.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.cliente.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(v.dataVenda).toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{v.quantidadeItens}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{v.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <Button onClick={() => abrirDetalhesModal(v)} variant="secondary" icon={<FaEye />}>
                                                Detalhes
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Modal para criar uma nova venda */}
            <Modal isOpen={isModalOpen} onClose={fecharModal} title="Registrar Nova Venda">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cliente</label>
                        <select
                            value={novaVenda.clienteId || ''}
                            onChange={e => setNovaVenda(prev => ({ ...prev, clienteId: parseInt(e.target.value) }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        >
                            <option value="">Selecione um cliente</option>
                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>

                    <div>
                        <h4 className="text-lg font-medium text-gray-800 mb-2">Itens da Venda</h4>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {novaVenda.itens.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                                    <select 
                                        value={item.medicamentoId} 
                                        onChange={e => handleItemChange(index, 'medicamentoId', parseInt(e.target.value))}
                                        className="block w-1/2 rounded-md border-gray-300 shadow-sm text-sm"
                                    >
                                        {medicamentos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                    </select>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={item.quantidade} 
                                        onChange={e => handleItemChange(index, 'quantidade', parseInt(e.target.value))}
                                        className="block w-1/4 rounded-md border-gray-300 shadow-sm text-sm"
                                    />
                                    <span className="w-1/4 text-sm text-gray-600">
                                        {(item.precoUnitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="secondary" onClick={handleAddItem} className="mt-2" icon={<FaShoppingCart />}>Adicionar Item</Button>
                    </div>
                    
                    {/* ATUALIZAÇÃO: O alerta de erro agora é renderizado aqui, dentro do modal. */}
                    {modalError && (
                        <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{modalError}</p>
                    )}

                    <div className="pt-4 border-t text-right">
                        <span className="text-xl font-bold text-gray-800">Total: {valorTotalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={fecharModal}>Cancelar</Button>
                        <Button type="submit">Finalizar Venda</Button>
                    </div>
                </form>
            </Modal>
            
            {/* Modal para exibir detalhes da venda */}
            <Modal isOpen={isDetalhesModalOpen} onClose={fecharDetalhesModal} title={`Detalhes da Venda #${vendaSelecionada?.id}`}>
                {vendaSelecionada && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Cliente</h4>
                            <p className="text-sm text-gray-600"><strong>Nome:</strong> {vendaSelecionada.cliente.nome}</p>
                            <p className="text-sm text-gray-600"><strong>CPF:</strong> {vendaSelecionada.cliente.cpf}</p>
                            <p className="text-sm text-gray-600"><strong>Email:</strong> {vendaSelecionada.cliente.email}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Data da Venda</h4>
                            <p className="text-sm text-gray-600">{new Date(vendaSelecionada.dataVenda).toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Itens ({vendaSelecionada.quantidadeItens})</h4>
                            <div className="mt-2 border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicamento</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {vendaSelecionada.itens.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 text-sm text-gray-800">{item.medicamentoNome}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600 text-right">{item.quantidade}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600 text-right">{item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                <td className="px-4 py-2 text-sm text-gray-800 font-semibold text-right">{item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="text-right font-bold text-xl text-gray-800 pt-4 border-t">
                            Total: {vendaSelecionada.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={fecharDetalhesModal} variant="secondary">Fechar</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Vendas;