
# Sistema de Gestão de Farmácia - Frontend

Esta é a aplicação frontend para o Sistema de Gestão de Farmácia, construída com React, TypeScript e Tailwind CSS.

## Pré-requisitos

Antes de começar, você precisará ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) e o `npm` instalados em sua máquina.

Também é **essencial** que a API backend esteja rodando localmente na porta `8080`, conforme especificado na documentação.

## Configuração

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd <diretorio-do-repositorio>
    ```

2.  **Instale as dependências:**
    Este projeto utiliza algumas bibliotecas para funcionalidades como roteamento e gráficos. Instale-as com o `npm`.

    ```bash
    npm install react react-dom react-router-dom recharts react-icons
    ```

3.  **Instale as dependências de desenvolvimento:**
    Para garantir a segurança de tipos e para rodar o ambiente de desenvolvimento com Vite.
    ```bash
    npm install --save-dev typescript @types/react @types/react-dom vite @vitejs/plugin-react
    ```
    
## Rodando a Aplicação

Para iniciar o servidor de desenvolvimento, utilize o Vite.

1.  **Inicie a aplicação:**
    Após instalar as dependências, execute o comando:
    ```bash
    npx vite
    ```
    O Vite iniciará um servidor de desenvolvimento (geralmente em `http://localhost:5173`). Abra este endereço no seu navegador. Você será direcionado para a tela de login. As chamadas para a API serão automaticamente redirecionadas para `http://localhost:8080` para evitar erros de CORS.

## Estrutura do Projeto

-   `vite.config.ts`: Arquivo de configuração do Vite, incluindo o proxy para a API.
-   `index.html`: Ponto de entrada HTML.
-   `index.tsx`: Ponto de entrada da aplicação React.
-   `App.tsx`: Componente principal que gerencia o layout e as rotas.
-   `components/`: Contém componentes de UI reutilizáveis (Botões, Modais, Tabelas, Layout).
-   `pages/`: Contém os componentes de página para cada funcionalidade (Dashboard, Medicamentos, etc.).
-   `services/`: Lógica para comunicação com a API backend.
-   `types.ts`: Definições de tipos TypeScript para as entidades da API (Medicamento, Cliente, etc.).
-   `contexts/`: Contém os Contextos React, como o de Autenticação.

Aproveite o desenvolvimento!
