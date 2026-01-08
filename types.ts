// Colega, este arquivo é um dos mais importantes para a saúde do nosso projeto.
// Definir os "contratos" (tipos) dos dados que vêm da API aqui nos ajuda a evitar
// muitos bugs comuns, pois o TypeScript nos avisará se tentarmos acessar uma propriedade que não existe.

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  // ATUALIZAÇÃO: A API retorna diferentes formatos para Categoria.
  // O endpoint /categorias retorna 'quantidadeMedicamentos'.
  // O endpoint /estoque/recentes retorna 'medicamentos' aninhado.
  // Para acomodar ambos, tornamos os dois campos opcionais.
  quantidadeMedicamentos?: number;
  medicamentos?: string[];
}

// Enum para o status do medicamento, para evitar strings mágicas no código.
export enum StatusMedicamento {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export interface Medicamento {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  dataValidade: string; // Formato YYYY-MM-DD
  categoria: Categoria;
  // CORREÇÃO: Alteramos de 'ativo: boolean' para 'status: StatusMedicamento'
  // para corresponder exatamente ao que a API nos envia.
  status: StatusMedicamento;
  // ATUALIZAÇÃO: Adicionamos o campo 'vendido', que apareceu na resposta da API de movimentações.
  // Colocamos como opcional (?) pois pode não vir em todos os endpoints.
  vendido?: boolean;
}

// ATUALIZAÇÃO: Criamos um tipo para o medicamento que vem no endpoint de movimentações.
// Ele é uma versão simplificada, sem o objeto 'categoria' aninhado.
export interface MedicamentoBasico extends Omit<Medicamento, "categoria"> {
  // Este tipo herda tudo de Medicamento, exceto o campo 'categoria'.
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string; // Formato YYYY-MM-DD
  // ATUALIZAÇÃO: Adicionamos a propriedade `maiorDeIdade` que vem da API.
  // Vamos usar isso para filtrar os clientes na tela de vendas.
  // CORREÇÃO: Olá! O erro na página de Clientes acontecia porque estávamos exigindo o campo `maiorDeIdade`
  // na hora de criar ou atualizar um cliente. No entanto, esse campo é calculado pelo backend com base
  // na data de nascimento. A solução é torná-lo opcional (?) aqui no nosso tipo. Assim, o TypeScript
  // entende que não precisamos enviá-lo, mas podemos recebê-lo da API.
  maiorDeIdade?: boolean;
  totalCompras: number;
}

// CORREÇÃO: Atualizamos a interface VendaItem para refletir os dados detalhados
// que a API nos envia na listagem de vendas.
export interface VendaItem {
  id: number;
  medicamentoId: number;
  medicamentoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

// CORREÇÃO: A interface Venda agora possui todos os campos retornados pela API,
// como a quantidade de itens e usa a nova VendaItem.
export interface Venda {
  id: number;
  cliente: Cliente;
  itens: VendaItem[];
  dataVenda: string;
  valorTotal: number;
  quantidadeItens: number;
}

// CORREÇÃO: A API de alertas retorna um objeto específico para o alerta,
// e não o objeto Medicamento completo. Vamos criar tipos corretos para eles.
export interface AlertaEstoque {
  medicamentoId: number;
  medicamentoNome: string;
  quantidadeAtual: number;
}

export interface AlertaValidade {
  medicamentoId: number;
  medicamentoNome: string;
  dataValidade: string; // Formato YYYY-MM-DD
}

// Tipos para a nova funcionalidade de Estoque
export enum TipoMovimentacao {
  ENTRADA = "ENTRADA",
  SAIDA = "SAIDA",
  AJUSTE = "AJUSTE",
  PERDA = "PERDA",
  VENDA = "VENDA",
}

export interface MovimentacaoEstoqueRequest {
  medicamentoId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo?: string;
  observacao?: string;
}

// Novo tipo para representar uma movimentação de estoque retornada pela API.
export interface MovimentacaoEstoque {
  id: number;
  // ATUALIZAÇÃO: Usamos o tipo MedicamentoBasico para refletir a resposta real da API.
  medicamento: MedicamentoBasico;
  tipo: TipoMovimentacao;
  quantidade: number;
  dataMovimentacao: string;
  observacao?: string;
}
