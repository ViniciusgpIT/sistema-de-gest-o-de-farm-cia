
// CORREÇÃO: Olá! Para resolver o erro 'Cannot find name 'TipoMovimentacao'',
// precisamos importar o enum 'TipoMovimentacao' que está definido no nosso arquivo `types.ts`.
// Sem ele, o TypeScript não sabe o que `TipoMovimentacao.ENTRADA` significa.
import { Categoria, Medicamento, Cliente, Venda, AlertaEstoque, AlertaValidade, StatusMedicamento, MovimentacaoEstoqueRequest, TipoMovimentacao, MovimentacaoEstoque } from '../types';

// Aqui centralizamos toda a comunicação com o backend.
const API_BASE_URL = '/api';

// Uma função genérica para fazer as requisições.
// Ela já trata a conversão para JSON e a checagem de erros de HTTP.
async function fetchApi<T,>(path: string, options: RequestInit = {}): Promise<T> {
  // Olá! Modifiquei aqui para buscar o token de autenticação do localStorage.
  // Isso torna nossa API dinâmica e segura, em vez de usar credenciais fixas.
  const authToken = localStorage.getItem('authToken');
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Basic ${authToken}` })
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Se o erro for 401 (Não Autorizado), é provável que o token seja inválido ou expirado.
      // O ideal seria deslogar o usuário aqui, mas nosso AuthContext já cuidará disso.
      throw new Error('Não autorizado. Faça login novamente.');
    }
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Ocorreu um erro na API.');
    } catch (e) {
      throw new Error(errorText || `Erro na API: ${response.statusText}`);
    }
  }
  
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// --- Autenticação ---
// Nova função para testar as credenciais de login.
// Ela tenta fazer uma chamada a um endpoint protegido. Se funcionar, retorna o token.
export const loginRequest = async (username, password) => {
    const authToken = btoa(`${username}:${password}`);
    const response = await fetch(`${API_BASE_URL}/medicamentos`, { // Testa contra um endpoint que sabemos que é protegido.
        headers: { 'Authorization': `Basic ${authToken}` },
        // CORREÇÃO: Adicionamos 'omit' para instruir o navegador a não
        // exibir o prompt de autenticação nativo em caso de erro 401.
        // Nós queremos tratar o erro no nosso próprio código e exibir uma mensagem customizada.
        credentials: 'omit'
    });
    if (!response.ok) {
        throw new Error('Credenciais inválidas');
    }
    return authToken; // Retorna o token codificado em base64 em caso de sucesso.
};

// Funções específicas para cada endpoint da API.

type CategoriaPayload = Pick<Categoria, 'nome' | 'descricao'>;

// --- Categorias ---
export const getCategorias = () => fetchApi<Categoria[]>('/categorias');
export const createCategoria = (data: CategoriaPayload) => fetchApi<Categoria>('/categorias', { method: 'POST', body: JSON.stringify(data) });
export const updateCategoria = (id: number, data: CategoriaPayload) => fetchApi<Categoria>(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategoria = (id: number) => fetchApi<void>(`/categorias/${id}`, { method: 'DELETE' });

// --- Medicamentos ---
export const getMedicamentos = () => fetchApi<Medicamento[]>('/medicamentos');
export const createMedicamento = (data: any) => fetchApi<Medicamento>('/medicamentos', { method: 'POST', body: JSON.stringify(data) });
export const updateMedicamento = (id: number, data: any) => fetchApi<Medicamento>(`/medicamentos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMedicamento = (id: number) => fetchApi<void>(`/medicamentos/${id}`, { method: 'DELETE' });
export const updateStatusMedicamento = (id: number, status: StatusMedicamento) => fetchApi<Medicamento>(`/medicamentos/${id}/status?status=${status}`, { method: 'PATCH' });

// --- Clientes ---
export const getClientes = () => fetchApi<Cliente[]>('/clientes');
export const createCliente = (data: Omit<Cliente, 'id'>) => fetchApi<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(data) });
export const updateCliente = (id: number, data: Omit<Cliente, 'id'>) => fetchApi<Cliente>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCliente = (id: number) => fetchApi<void>(`/clientes/${id}`, { method: 'DELETE' });

// --- Vendas ---
export const getVendas = () => fetchApi<Venda[]>('/vendas');
export const createVenda = (data: any) => fetchApi<Venda>('/vendas', { method: 'POST', body: JSON.stringify(data) });


// --- Alertas ---
export const getAlertasEstoqueBaixo = () => fetchApi<AlertaEstoque[]>('/alertas/estoque-baixo');
export const getAlertasValidadeProxima = () => fetchApi<AlertaValidade[]>('/alertas/validade-proxima');

// --- Estoque ---
export const getMovimentacoesRecentes = () => fetchApi<MovimentacaoEstoque[]>('/estoque/recentes');

export const registrarMovimentacao = (data: MovimentacaoEstoqueRequest) => {
  let path: string;
  
  switch (data.tipo) {
    case TipoMovimentacao.ENTRADA:
      path = '/estoque/entrada';
      break;
    case TipoMovimentacao.SAIDA:
      path = '/estoque/saida';
      break;
    default:
      return Promise.reject(new Error(`O tipo de movimentação '${data.tipo}' não é suportado.`));
  }

  const payload = {
    tipo : data.tipo,
    medicamentoId: data.medicamentoId,
    quantidade: data.quantidade,
    motivo: data.motivo,
    observacao: data.observacao,
  };

  return fetchApi<void>(path, { method: 'POST', body: JSON.stringify(payload) });
};
