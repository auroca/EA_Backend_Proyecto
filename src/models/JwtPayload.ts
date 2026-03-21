export type UserRole = 'admin' | 'user';

export interface IJwtPayload {
    id: string;
    name: string;
    email: string;
    rol: UserRole;
}