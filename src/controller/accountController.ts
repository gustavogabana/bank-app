// src/controller/accountController.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AccountService } from '../service/accountService';
import { IAuthenticatedRequest } from '@/interface/authenticatedRequest';

const prisma = new PrismaClient();
const accountService = new AccountService(prisma);

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = request.body as { username: string; password: string };

    try {
        const token = await accountService.loginUser(username, password);
        return reply.status(201).send({ token });
    } catch (error) {
        // Credenciais inválidas
        const errorMessage = (error as Error).message;
        return reply.status(401).send({ message: errorMessage });
    }
};

export const createAccount = async (request: IAuthenticatedRequest, reply: FastifyReply) => {
    const { amount } = request.body as { amount: number };

    // Validação do saldo inicial
    if (typeof amount !== 'number' || amount < 0) {
        return reply.status(400).send({ message: 'O saldo inicial deve ser um número não negativo.' });
    }

    const userId = request.user?.id;

    if (!userId) {
        return reply.status(401).send({ message: 'Usuário não autenticado.' });
    }

    try {
        const account = await accountService.createAccount(userId, amount);
        return reply.status(201).send(account);
    } catch (error) {
        return reply.status(500).send({ message: 'Erro interno' });
    }
};

export const getBalance = async (request: IAuthenticatedRequest, reply: FastifyReply) => {
    const account = request.params as { accountId: string };
    const userId = request.user?.id;

    if (!userId) {
        return reply.status(401).send({ message: 'Usuário não autenticado.' });
    }

    try {
        const balance = await accountService.getBalance(userId, parseInt(account.accountId));
        return reply.status(200).send({ balance });
    } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage === 'Conta não encontrada') {
            return reply.status(404).send({ message: errorMessage });
        }
        return reply.status(500).send({ message: 'Erro interno' });
    }
};

export const deposit = async (request: IAuthenticatedRequest, reply: FastifyReply) => {
    const { account, amount } = request.body as { account: number; amount: number };

    const userId = request.user?.id;

    if (!userId) {
        return reply.status(401).send({ message: 'Usuário não autenticado.' });
    }

    try {
        const newBalance = await accountService.deposit(userId, account, amount);
        return reply.status(200).send({ message: 'Depósito realizado com sucesso.', newBalance });
    } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage === 'Conta não encontrada') {
            return reply.status(404).send({ message: errorMessage });
        }
        return reply.status(500).send({ message: 'Erro interno' });
    }
};

export const withdraw = async (request: IAuthenticatedRequest, reply: FastifyReply) => {
    const { account, amount } = request.body as { account: number; amount: number };
    const userId = request.user?.id;

    if (!userId) {
        return reply.status(401).send({ message: 'Usuário não autenticado.' });
    }

    try {
        const result = await accountService.withdraw(userId, account, amount);
        return reply.status(200).send({ withdrawn: result.withdrawn, newBalance: result.newBalance });
    } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage === 'Conta não encontrada') {
            return reply.status(404).send({ message: errorMessage });
        } else if (errorMessage === 'Saldo insuficiente para realizar o saque.') {
            return reply.status(400).send({ message: errorMessage });
        }
        return reply.status(500).send({ message: 'Erro interno' });
    }
};

export const transferBetweenAccounts = async (request: IAuthenticatedRequest, reply: FastifyReply) => {
    const { sourceAccountId, destinationAccountId, amount } = request.body as { sourceAccountId: number; destinationAccountId: number; amount: number };

    const userId = request.user?.id;

    if (!userId) {
        return reply.status(401).send({ message: 'Usuário não autenticado.' });
    }

    try {
        const result = await accountService.transferBetweenAccounts(userId, sourceAccountId, destinationAccountId, amount);
        return reply.status(200).send({
            sourceNewBalance: result.sourceNewBalance,
            destinationNewBalance: result.destinationNewBalance,
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage === 'Conta de origem não encontrada') {
            return reply.status(404).send({ message: errorMessage });
        } else if (errorMessage === 'Conta de destino não encontrada') {
            return reply.status(404).send({ message: errorMessage });
        } else if (errorMessage === 'Saldo insuficiente para realizar a transferência.') {
            return reply.status(400).send({ message: errorMessage });
        }
        return reply.status(500).send({ message: 'Erro interno' });
    }
};

export const resetDatabase = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await accountService.resetDatabase();
        return reply.status(200).send({ message: 'Banco de dados resetado com sucesso.' });
    } catch (error) {
        return reply.status(500).send({ message: 'Erro ao resetar o banco de dados.' });
    }
};

