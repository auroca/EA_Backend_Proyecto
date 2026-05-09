export type UserRole = 'admin' | 'user';

export interface IJwtPayload {
    id: string;
    username: string;
    email: string;
    rol: UserRole;
}