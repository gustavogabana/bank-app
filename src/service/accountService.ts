// src/service/AccountService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const SECRET_KEY = process.env.SECRET_KEY || 'default';

export class AccountService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    public async loginUser(username: string, password: string): Promise<string> {
        const user = await this.prisma.user.findUnique({ where: { username } });

        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await this.prisma.user.create({
                data: { username, password: hashedPassword }
            });

            const token = jwt.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY, { expiresIn: '1h' });

            await this.prisma.token.create({
                data: { user_id: newUser.id, token }
            });

            return token;
        } else {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error('Credenciais inválidas');
            }

            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

            await this.prisma.token.create({
                data: { user_id: user.id, token }
            });

            return token;
        }
    }

    public async createAccount(userId: number, initialBalance: number) {
        try {
            const account = await this.prisma.account.create({
                data: {
                    balance: initialBalance,
                    user: {
                        connect: { id: userId }
                    }
                }
            });
            return account;
        } catch (error) {
            throw new Error('Erro ao criar conta: ' + error);
        }
    }

    public async getBalance(userId: number, accountId: number): Promise<number> {
        const account = await this.prisma.account.findFirst({
            where: {
                id: accountId,
                user_id: userId,
            },
            select: { balance: true },
        });

        if (!account) {
            throw new Error('Conta não encontrada');
        }

        return account.balance;
    }

    public async deposit(userId: number, accountId: number, amount: number): Promise<number> {
        if (amount <= 0) {
            throw new Error('O valor do depósito deve ser maior que zero.');
        }
    
        const account = await this.prisma.account.findFirst({
            where: {
                id: accountId,
                user_id: userId,
            },
        });
    
        if (!account) {
            throw new Error('Conta não encontrada');
        }
    
        const updatedAccount = await this.prisma.account.update({
            where: { id: accountId },
            data: { balance: account.balance + amount },
        });
    
        return updatedAccount.balance;
    }

    public async withdraw(userId: number, accountId: number, amount: number): Promise<{ withdrawn: number; newBalance: number }> {
        // Verifica se o valor do saque é válido
        if (amount <= 0) {
            throw new Error('O valor do saque deve ser maior que zero.');
        }
    
        // Encontra a conta do usuário
        const account = await this.prisma.account.findFirst({
            where: {
                id: accountId,
                user_id: userId,
            },
        });
    
        if (!account) {
            throw new Error('Conta não encontrada');
        }
    
        // Verifica se o saldo é suficiente
        if (account.balance < amount) {
            throw new Error('Saldo insuficiente para realizar o saque.');
        }
    
        // Realiza o saque e atualiza o saldo da conta
        const updatedAccount = await this.prisma.account.update({
            where: { id: account.id },
            data: { balance: account.balance - amount },
        });
    
        return {
            withdrawn: amount,
            newBalance: updatedAccount.balance,
        };
    }

    public async transferBetweenAccounts(userId: number, sourceAccountId: number, destinationAccountId: number, amount: number): Promise<{ sourceNewBalance: number; destinationNewBalance: number }> {
        // Verifica se o valor da transferência é válido
        if (amount <= 0) {
            throw new Error('O valor da transferência deve ser maior que zero.');
        }
    
        // Encontra a conta de origem
        const sourceAccount = await this.prisma.account.findFirst({
            where: {
                id: sourceAccountId,
                user_id: userId, // Verifica se é a conta do próprio usuário
            },
        });
    
        if (!sourceAccount) {
            throw new Error('Conta de origem não encontrada');
        }
    
        // Verifica se o saldo é suficiente
        if (sourceAccount.balance < amount) {
            throw new Error('Saldo insuficiente para realizar a transferência.');
        }
    
        // Encontra a conta de destino
        const destinationAccount = await this.prisma.account.findFirst({
            where: {
                id: destinationAccountId,
            },
        });
    
        if (!destinationAccount) {
            throw new Error('Conta de destino não encontrada');
        }
    
        // Realiza a transferência
        const updatedSourceAccount = await this.prisma.account.update({
            where: { id: sourceAccount.id },
            data: { balance: sourceAccount.balance - amount },
        });
    
        const updatedDestinationAccount = await this.prisma.account.update({
            where: { id: destinationAccount.id },
            data: { balance: destinationAccount.balance + amount },
        });
    
        return {
            sourceNewBalance: updatedSourceAccount.balance,
            destinationNewBalance: updatedDestinationAccount.balance,
        };
    }
    
    public async resetDatabase(): Promise<void> {
        await this.prisma.token.deleteMany({});
        await this.prisma.account.deleteMany({});
        await this.prisma.user.deleteMany({});
    }    
    
}
