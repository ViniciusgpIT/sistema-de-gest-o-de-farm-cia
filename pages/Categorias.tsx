
import React, { useState, useEffect, useCallback } from 'react';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/api';
import { Categoria } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// E aqui, a página de Categorias. A repetição do padrão CRUD solidifica a
// arquitetura que escolhemos. Fica fácil de dar manutenção e de adicionar
// novas entidades no futuro, se necessário.

const Categorias: React.FC = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoriaAtual, setCategoriaAtual] = useState<Partial<Categoria> | null>(null);

    const carregarCategorias = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCategorias();
            setCategorias(data);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar categorias.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarCategorias();
    }, [carregarCategorias]);

    const abrirModal = (categoria: Partial<Categoria> | null = null) => {
        setCategoriaAtual(categoria ? { ...categoria } : {});
        setIsModalOpen(true);
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setCategoriaAtual(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!categoriaAtual || !categoriaAtual.nome) {
            setError("O nome é obrigatório.");
            return;
        }

        const dataToSend: Pick<Categoria, 'nome' | 'descricao'> = {
            nome: categoriaAtual.nome,
            descricao: categoriaAtual.descricao || ''
        };

        try {
            if (categoriaAtual.id) {
                await updateCategoria(categoriaAtual.id, dataToSend);
            } else {
                await createCategoria(dataToSend);
            }
            fecharModal();
            carregarCategorias();
        } catch (err) {
            console.error(err);
            setError('Falha ao salvar a categoria.');
        }
    };
    
    const handleExcluir = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            try {
                await deleteCategoria(id);
                carregarCategorias();
            } catch (err) {
                const apiError = err as Error;
                setError(apiError.message || 'Falha ao excluir a categoria. Verifique se ela não está vinculada a medicamentos.');
                console.error(err);
            }
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciar Categorias</h1>
                <Button onClick={() => abrirModal()} icon={<FaPlus />}>
                    Nova Categoria
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Medicamentos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categorias.map(cat => (
                                    <tr key={cat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.nome}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.descricao}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-700">
                                            {/* 
                                              ATUALIZAÇÃO: Como 'quantidadeMedicamentos' agora é opcional no nosso tipo,
                                              usamos `?? 0` para garantir que, se a API não enviar esse campo,
                                              exibiremos 0 em vez de um campo vazio ou um erro.
                                            */}
                                            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                                                {cat.quantidadeMedicamentos ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => abrirModal(cat)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                                            <button onClick={() => handleExcluir(cat.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={fecharModal} title={categoriaAtual?.id ? 'Editar Categoria' : 'Nova Categoria'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" value={categoriaAtual?.nome || ''} onChange={e => setCategoriaAtual({...categoriaAtual, nome: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea value={categoriaAtual?.descricao || ''} onChange={e => setCategoriaAtual({...categoriaAtual, descricao: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
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

export default Categorias;