export enum UserRole {
  COMPRADOR = 'comprador',
  ADMIN = 'admin',
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
