import { IAuthenticatedRequest } from '@/interface/authenticatedRequest';
import { FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'default';

export const authenticate = async (request: IAuthenticatedRequest, reply: FastifyReply) => {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
        return reply.status(401).send({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { id: number; username: string };
        request.user = decoded;
    } catch (error) {
        return reply.status(403).send({ message: 'Token inválido' });
    }
};
