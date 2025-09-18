# Projeto E-commerce Completo (API & Client)

![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-393?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)

Este é um projeto full-stack de e-commerce que simula um ambiente de loja virtual completo, desde a listagem de produtos até a criação e acompanhamento de pedidos com um fluxo de pagamento assíncrono.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tech Stack](#tech-stack)
- [Pré-requisitos](#pré-requisitos)
- [Como Rodar o Projeto (Setup)](#como-rodar-o-projeto-setup)
  - [1. Variáveis de Ambiente](#1-variáveis-de-ambiente)
  - [2. Backend](#2-backend)
  - [3. Frontend](#3-frontend)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Documentação da API](#documentação-da-api)
  - [Autenticação](#autenticação)
  - [Produtos](#produtos)
  - [Pedidos (Orders)](#pedidos-orders)
- [Testes](#testes)

## Demonstração(Principais Páginas)
Aqui você pode ver uma prévia de como a aplicação funciona.
### Painel Admin
![Fluxo de Checkout](./docs/images/image1.png)
### Página Meus Pedidos(Com Status da compra com Redis (Docker))
![Fluxo de Checkout](./docs/images/image2.png)
### Página de Produtos
![Fluxo de Checkout](./docs/images/image3.png)
### Console de Logs
![Fluxo de Checkout](./docs/images/image4.png)


## Funcionalidades

- **Autenticação de Usuários:** Cadastro e Login com JWT.
- **Gestão de Produtos:** Admins podem criar e atualizar produtos.
- **Listagem de Produtos:** Página pública para visualização e busca de produtos.
- **Carrinho de Compras:** Contexto completo para adicionar, remover e atualizar itens.
- **Checkout:** Finalização de compra integrada com o usuário logado.
- **Meus Pedidos:** Página para o usuário visualizar o histórico e o status de seus pedidos.
- **Processamento Assíncrono:** Uso de Redis para simular um fluxo de pagamento e atualização de estoque que não trava a experiência do usuário.

## Tech Stack

A aplicação é dividida em duas partes principais:

#### **Backend**
- **Linguagem:** TypeScript
- **Framework:** Node.js com Express.js
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Filas e Cache:** Redis
- **Autenticação:** JWT (JSON Web Tokens) e bcrypt.js
- **Ferramentas de Desenvolvimento:** `ts-node-dev`, `concurrently`

#### **Frontend**
- **Biblioteca:** React
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Roteamento:** React Router DOM
- **Requisições HTTP:** Axios
- **Gerenciamento de Estado:** React Context API (`useAuth`, `useCart`)

## Pré-requisitos

Antes de começar, você precisa ter as seguintes ferramentas instaladas na sua máquina:
- [Node.js](https://nodejs.org/en/) (v18 ou superior)
- [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (Recomendado para rodar PostgreSQL e Redis facilmente)
- Um cliente de terminal (Git Bash, PowerShell, etc.)

## Como Rodar o Projeto (Setup)

Siga os passos abaixo para configurar e rodar o ambiente de desenvolvimento local.

```bash
# 1. Clone o repositório para sua máquina
git clone <URL_DO_SEU_REPOSITORIO>

# 2. Navegue para a pasta do projeto
cd ecommerce
```

### 1. Variáveis de Ambiente

No back-end, você precisa configurar um arquivo `.env`.

```bash
# 1. Navegue até a pasta do back-end
cd back-end

# 2. Copie o arquivo de exemplo
cp .env.example .env
```
Agora, abra o arquivo `.env` e preencha as variáveis, principalmente a `DATABASE_URL` e a `JWT_SECRET`.

**`back-end/.env`**
```env
# URL de conexão com o seu banco de dados PostgreSQL
# Exemplo: postgresql://SEU_USER:SUA_SENHA@localhost:5432/SEU_BANCO
DATABASE_URL="postgresql://docker:docker@localhost:5432/ecommerce"

# Chave secreta para gerar os tokens JWT. Pode ser qualquer string segura.
JWT_SECRET="SUA_CHAVE_SECRETA_SUPER_FORTE"
```

### 2. Backend

Com as variáveis de ambiente configuradas, vamos preparar e iniciar o back-end.

```bash
# 1. Ainda na pasta back-end, instale as dependências
npm install

# 2. Rode as migrations do Prisma para criar as tabelas no banco de dados
npx prisma migrate dev

# 3. (Opcional) Popule o banco com dados de teste, se tiver um script de seed
# npx prisma db seed

# 4. Inicie o servidor da API e os serviços do Redis
npm run dev
```
Seu back-end estará rodando! O comando `npm run dev` usa o `concurrently` para iniciar a API e os serviços de fila em um único terminal.

### 3. Frontend

Abra um **novo terminal** para rodar o front-end.

```bash
# 1. Navegue para a pasta do front-end
cd front-end

# 2. Instale as dependências
npm install

# 3. Inicie a aplicação React
npm run dev
```
Agora você pode acessar a aplicação no seu navegador, geralmente em `http://localhost:5173`.

## Scripts Disponíveis

Dentro de `back-end/package.json`, o principal script é:
- `npm run dev`: Inicia a API e o serviço de estoque simultaneamente.

Dentro de `front-end/package.json`:
- `npm run dev`: Inicia o servidor de desenvolvimento do React (Vite).
- `npm run build`: Compila a aplicação para produção.

## Documentação da API

Todos os endpoints são prefixados com `/api` (ajuste conforme sua configuração).

### Autenticação
| Método HTTP | Endpoint           | Descrição                       | Autenticação | Corpo da Requisição (Exemplo)                                    |
| :---------- | :----------------- | :------------------------------ | :----------- | :--------------------------------------------------------------- |
| `POST`      | `/auth/register`   | Registra um novo usuário/cliente. | Nenhuma      | `{"name": "...", "email": "...", "password": "...", "cpf_cnpj": "..."}` |
| `POST`      | `/auth/login`      | Autentica um usuário e retorna um token JWT. | Nenhuma | `{"email": "...", "password": "..."}`                            |

### Produtos
| Método HTTP | Endpoint        | Descrição                         | Autenticação   | Corpo da Requisição (Exemplo)                    |
| :---------- | :-------------- | :-------------------------------- | :------------- | :----------------------------------------------- |
| `GET`       | `/products`     | Retorna uma lista de todos os produtos. | Nenhuma        | N/A                                              |
| `POST`      | `/products`     | Cria um novo produto.             | Admin          | `{"name": "...", "price": 19.99, "stock": 100}` |
| `PATCH`     | `/products/:id` | Atualiza um produto existente.    | Admin          | `{"name": "...", "price": 29.99}`                 |

### Pedidos (Orders)
| Método HTTP | Endpoint                        | Descrição                                         | Autenticação | Corpo da Requisição (Exemplo)                                                                 |
| :---------- | :------------------------------ | :------------------------------------------------ | :----------- | :-------------------------------------------------------------------------------------------- |
| `POST`      | `/orders`                       | Cria um novo pedido para o cliente logado.        | Usuário      | `{"customerId": "...", "products": [{"productId": "...", "quantity": 2}]}`                    |
| `GET`       | `/orders/my-orders`             | Retorna a lista de pedidos do usuário logado.     | Usuário      | N/A                                                                                           |
| `GET`       | `/orders/:id`                   | Retorna os detalhes de um pedido específico.      | Nenhuma      | N/A                                                                                           |
| `POST`      | `/orders/:id/confirm-payment`   | Simula a confirmação de pagamento de um pedido.   | Usuário      | N/A                                                                                           |