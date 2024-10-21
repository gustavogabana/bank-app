import { FastifyInstance } from 'fastify';
import { createAccount, deposit, getBalance, login, resetDatabase, transferBetweenAccounts, withdraw } from '../controller/accountController';
import { authenticate } from '../middleware/authMiddleware';

// Função para registrar as rotas
export default async (fastify: FastifyInstance) => {
    fastify.post('/login', login);
    // Middleware para os próximos métodos
    fastify.post('/account', { preHandler: authenticate }, createAccount);
    fastify.get('/balance/:accountId', { preHandler: authenticate }, getBalance);
    fastify.post('/deposit', { preHandler: authenticate }, deposit);
    fastify.post('/withdraw', { preHandler: authenticate }, withdraw);
    fastify.post('/transferBetweenAccounts', { preHandler: authenticate }, transferBetweenAccounts);
    fastify.delete('/reset', { preHandler: authenticate }, resetDatabase);
};
