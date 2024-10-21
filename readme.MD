# Bank App

## Descrição
Este é um projeto de aplicação bancária simples desenvolvido com TypeScript, Fastify e SQLite. A aplicação permite operações bancárias básicas, como depósito, saque, transferência entre contas existentes e verificação de saldo, com um sistema de autenticação simples para proteger as operações.

## Stack
- **Backend:** TypeScript
- **Framework:** Fastify
- **Banco de Dados:** SQLite (via Prisma)

## Regras de Negócio

### Autenticação

- **Login**
  - **Endpoint:** `POST /login`
  - **Body:**
    ```json
    {
      "username": "admin",
      "password": "admin"
    }
    ```
  - **Resultado:** `201 Created` e `{"token": "seu_token_aqui"}`

### Manipulação de Contas

- **Resetar o Estado do Banco de Dados**
  - **Endpoint:** `DELETE /reset`
  - **Resultado:** `200 OK` e `{"message": "Banco de dados resetado com sucesso."}`

- **Criar Conta com Saldo Inicial**
  - **Endpoint:** `POST /accounts`
  - **Body:**
    ```json
    {
      "amount": 100
    }
    ```
  - **Resultado:** `201 Created` e o objeto da conta criada.

- **Obter Saldo de Conta Existente**
  - **Endpoint:** `GET /balance/:accountId`
  - **Resultado:** `200 OK` e `{"balance": saldo_atual}`

- **Depositar em Conta Existente**
  - **Endpoint:** `POST /deposit`
  - **Body:**
    ```json
    {
      "account": 100,
      "amount": 50
    }
    ```
  - **Resultado:** `200 OK` e `{"message": "Depósito realizado com sucesso.", "newBalance": saldo_atual}`

- **Sacar de Conta Existente**
  - **Endpoint:** `POST /withdraw`
  - **Body:**
    ```json
    {
      "account": 100,
      "amount": 20
    }
    ```
  - **Resultado:** `200 OK` e `{"withdrawn": 20, "newBalance": saldo_atual}`

- **Transferir entre Contas Existentes**
  - **Endpoint:** `POST /transfer`
  - **Body:**
    ```json
    {
      "sourceAccountId": 100,
      "destinationAccountId": 200,
      "amount": 30
    }
    ```
  - **Resultado:** `200 OK` e 
    ```json
    {
      "sourceNewBalance": saldo_nova_conta_origem,
      "destinationNewBalance": saldo_nova_conta_destino
    }
    ```

## Como Executar o Projeto

1. **Instale as dependências**
    ```bash
    npm install
    ```

2. **Execute a migration**
    ```bash
    npm run migrate
    ```

3. **Execute o Servidor**
    ```bash
    npm run dev
    ```

## Observações
- Para todas as requisições que requerem autenticação, inclua o Bearer token no header:
`Authorization: Bearer seu_token_aqui`
- Certifique-se de que as variáveis de ambiente necessárias (como `SECRET_KEY`) estejam configuradas corretamente antes de executar a aplicação.
- O endpoint de reset (`/reset`) é uma operação destrutiva que apaga todos os dados do banco de dados.
