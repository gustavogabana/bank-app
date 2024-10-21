import { FastifyRequest } from "fastify";

export interface IAuthenticatedRequest extends FastifyRequest {
    user?: { id: number; username: string };
}