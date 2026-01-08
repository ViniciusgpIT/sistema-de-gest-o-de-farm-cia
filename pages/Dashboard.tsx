
import React, { useEffect, useState } from 'react';
// Olá! Adicionei o Modal, Button e um novo ícone para a funcionalidade de detalhes.
import { FaBoxes, FaCalendarTimes, FaChartLine, FaExclamationCircle, FaArrowUp, FaArrowDown, FaWarehouse, FaInfoCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
// ATUALIZAÇÃO: Importamos getMedicamentos para buscar a lista completa e resolver o problema da categoria.
import { getAlertasEstoqueBaixo, getAlertasValidadeProxima, getVendas, getMovimentacoesRecentes, getMedicamentos } from '../services/api';
// ATUALIZAÇÃO: Importamos o tipo Medicamento completo para nossa nova lista.
import { AlertaEstoque, AlertaValidade, Venda, MovimentacaoEstoque, TipoMovimentacao, Medicamento } from '../types';

// O Dashboard é a primeira tela que o usuário vê. Devemos mostrar as informações mais
// importantes de forma clara e direta. Aqui, focamos nos alertas e em um resumo das vendas.

// Helper para estilizar o tipo de movimentação
const getEstiloMovimentacao = (tipo: TipoMovimentacao) => {
    switch (tipo) {
        case TipoMovimentacao.ENTRADA:
            return {
                texto: 'Entrada',
                cor: 'bg-green-100 text-green-800',
                icone: <FaArrowUp className="text-green-500" />
            };
        case TipoMovimentacao.SAIDA:
        case TipoMovimentacao.PERDA:
        case TipoMovimentacao.VENDA:
             return {
                texto: tipo.charAt(0) + tipo.slice(1).toLowerCase(),
                cor: 'bg-red-100 text-red-800',
                icone: <FaArrowDown className="text-red-500" />
            };
        default:
            return {
                texto: tipo,
                cor: 'bg-gray-100 text-gray-800',
                icone: null
            };
    }
}

function Dashboard() {
  // Estados para armazenar os dados que vêm da API.
  const [alertasEstoque, setAlertasEstoque] = useState<AlertaEstoque[]>([]);
  const [alertasValidade, setAlertasValidade] = useState<AlertaValidade[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  // ATUALIZAÇÃO: Novo estado para guardar a lista completa de medicamentos com suas categorias.
  const [todosMedicamentos, setTodosMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Novos estados para controlar o modal de detalhes da movimentação.
  const [isDetalhesMovimentacaoModalOpen, setIsDetalhesMovimentacaoModalOpen] = useState(false);
  const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState<MovimentacaoEstoque | null>(null);


  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        // ATUALIZAÇÃO: Adicionamos getMedicamentos() ao Promise.all para carregar tudo de uma vez.
        const [estoqueRes, validadeRes, vendasRes, movimentacoesRes, medicamentosRes] = await Promise.all([
          getAlertasEstoqueBaixo(),
          getAlertasValidadeProxima(),
          getVendas(),
          getMovimentacoesRecentes(),
          getMedicamentos() 
        ]);
        setAlertasEstoque(estoqueRes);
        setAlertasValidade(validadeRes);
        setVendas(vendasRes);
        // ATUALIZAÇÃO: Salvamos a lista completa de medicamentos no novo estado.
        setTodosMedicamentos(medicamentosRes);

        // ATUALIZAÇÃO: Ordenamos as movimentações pela data, da mais recente para a mais antiga.
        const movimentacoesOrdenadas = movimentacoesRes.sort((a, b) => new Date(b.dataMovimentacao).getTime() - new Date(a.dataMovimentacao).getTime());
        setMovimentacoes(movimentacoesOrdenadas);

        setError(null);
      } catch (err) {
        setError('Falha ao carregar os dados do dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Funções para abrir e fechar o novo modal de detalhes.
  const abrirDetalhesMovimentacaoModal = (mov: MovimentacaoEstoque) => {
    setMovimentacaoSelecionada(mov);
    setIsDetalhesMovimentacaoModalOpen(true);
  };

  const fecharDetalhesMovimentacaoModal = () => {
    setIsDetalhesMovimentacaoModalOpen(false);
    setMovimentacaoSelecionada(null);
  };
  
  const dadosGraficoVendas = vendas
    .map(venda => ({
        ...venda,
        data: new Date(venda.dataVenda).toLocaleDateString('pt-BR')
    }))
    .reduce((acc, venda) => {
        const itemExistente = acc.find(item => item.data === venda.data);
        if (itemExistente) {
            itemExistente.total += venda.valorTotal;
        } else {
            acc.push({ data: venda.data, total: venda.valorTotal });
        }
        return acc;
    }, [] as { data: string, total: number }[])
    .sort((a, b) => new Date(a.data.split('/').reverse().join('-')).getTime() - new Date(b.data.split('/').reverse().join('-')).getTime());
  
  const totalVendas = vendas.reduce((acc, v) => acc + v.valorTotal, 0);

  if (loading) return <div className="text-center p-8">Carregando dashboard...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  // ATUALIZAÇÃO: Lógica para encontrar o nome da categoria para o modal.
  const medicamentoCompleto = movimentacaoSelecionada 
      ? todosMedicamentos.find(m => m.id === movimentacaoSelecionada.medicamento.id) 
      : null;
  const nomeCategoria = medicamentoCompleto?.categoria?.nome || 'Não informada';


  return (
    <div className="space-y-8">
      {/* Seção de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Vendas Totais (Últimos 30 dias)" value={totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={<FaChartLine />} color="bg-green-500" />
        <Card title="Itens com Estoque Baixo" value={alertasEstoque.length} icon={<FaBoxes />} color="bg-yellow-500" />
        <Card title="Itens Próximos da Validade" value={alertasValidade.length} icon={<FaCalendarTimes />} color="bg-red-500" />
      </div>

      {/* Seção de Gráfico de Vendas */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Vendas Recentes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosGraficoVendas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <Legend />
            <Bar dataKey="total" fill="#3b82f6" name="Total de Vendas (R$)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Seção de Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><FaExclamationCircle className="mr-2 text-yellow-500" />Alerta de Estoque Baixo</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {alertasEstoque.length > 0 ? (
              alertasEstoque.map(item => <li key={item.medicamentoId} className="text-gray-600">{item.medicamentoNome} - <span className="font-bold">{item.quantidadeAtual} un.</span></li>)
            ) : <p className="text-gray-500">Nenhum item com estoque baixo.</p>}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><FaExclamationCircle className="mr-2 text-red-500" />Alerta de Validade</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {alertasValidade.length > 0 ? (
             alertasValidade.map(item => <li key={item.medicamentoId} className="text-gray-600">{item.medicamentoNome} - <span className="font-bold">Vence em: {new Date(item.dataValidade).toLocaleDateString('pt-BR')}</span></li>)
            ) : <p className="text-gray-500">Nenhum item próximo da validade.</p>}
          </ul>
        </div>
      </div>
      
       {/* Seção: Últimas Movimentações de Estoque */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><FaWarehouse className="mr-2 text-blue-500" />Últimas Movimentações de Estoque</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {movimentacoes.length > 0 ? (
            movimentacoes.map(mov => {
              const estilo = getEstiloMovimentacao(mov.tipo);
              const sinal = mov.tipo === 'ENTRADA' ? '+' : '-';
              return (
                <div key={mov.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="mr-3 text-lg">{estilo.icone}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{mov.medicamento.nome}</p>
                      <p className="text-xs text-gray-500">{new Date(mov.dataMovimentacao).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  {/* ATUALIZAÇÃO: Adicionamos um contêiner flex para o botão de detalhes. */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${estilo.cor}`}>{estilo.texto}</span>
                       <p className="font-bold text-gray-700">{sinal}{mov.quantidade}</p>
                    </div>
                    {/* ATUALIZAÇÃO: Novo botão para abrir o modal de detalhes. */}
                    <Button onClick={() => abrirDetalhesMovimentacaoModal(mov)} variant="secondary" icon={<FaInfoCircle />}>
                      Detalhes
                    </Button>
                  </div>
                </div>
              );
            })
          ) : <p className="text-gray-500">Nenhuma movimentação de estoque recente.</p>}
        </div>
      </div>

      {/* NOVO: Modal para exibir detalhes da movimentação */}
      <Modal isOpen={isDetalhesMovimentacaoModalOpen} onClose={fecharDetalhesMovimentacaoModal} title={`Detalhes da Movimentação #${movimentacaoSelecionada?.id}`}>
        {movimentacaoSelecionada && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Medicamento</h4>
              <p className="text-sm text-gray-600"><strong>Nome:</strong> {movimentacaoSelecionada.medicamento.nome}</p>
              {/* 
                CORREÇÃO: Agora usamos a variável 'nomeCategoria' que busca o nome da categoria
                na lista completa de medicamentos que carregamos no início.
              */}
              <p className="text-sm text-gray-600"><strong>Categoria:</strong> {nomeCategoria}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Detalhes da Movimentação</h4>
              <p className="text-sm text-gray-600"><strong>Tipo:</strong> {getEstiloMovimentacao(movimentacaoSelecionada.tipo).texto}</p>
              <p className="text-sm text-gray-600"><strong>Quantidade:</strong> {movimentacaoSelecionada.quantidade}</p>
              <p className="text-sm text-gray-600"><strong>Data:</strong> {new Date(movimentacaoSelecionada.dataMovimentacao).toLocaleString('pt-BR')}</p>
              {movimentacaoSelecionada.observacao && (
                <p className="text-sm text-gray-600"><strong>Observação:</strong> {movimentacaoSelecionada.observacao}</p>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={fecharDetalhesMovimentacaoModal} variant="secondary">Fechar</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default Dashboard;
