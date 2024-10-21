import fastify from 'fastify';
import accountRoutes from './routes/accountRoutes';

// Cria uma instância do Fastify como server
const app = fastify({ logger: true });

// Registra as rotas da conta
app.register(accountRoutes);

const start = async () => {
    try {
        await app.listen({ port: 3000 });
        console.log('Servidor rodando em http://localhost:3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
