import type { UserRole } from '../../types/index.js';
import type { SubCommandArguments } from './sub-command-arguments.js';
import type {
  ArgumentConfig,
  OptionalPropertyOptions,
} from 'ts-command-line-args';

export interface GetUsersArguments extends SubCommandArguments {}

export const GetUsersArgumentsConfig = {};

export interface GetUserByIdArguments extends SubCommandArguments {
  id: string;
}

export const GetUserByIdArgumentsConfig = {
  id: String,
};

// Fonction de transformation pour convertir une string en UserRole
function parseUserRole(value: string): UserRole {
  if (value === 'CUSTOMER' || value === 'SELLER' || value === 'ADMIN') {
    return value as UserRole;
  }
  throw new Error(
    `Invalid role: ${value}. Must be one of: CUSTOMER, SELLER, ADMIN`,
  );
}

export interface CreateUserArguments extends SubCommandArguments {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export const CreateUserArgumentsConfig = {
  name: String,
  password: String,
  role: { type: parseUserRole, optional: false },
  email: { type: String, optional: false },
};

export interface LoginArguments extends SubCommandArguments {
  email: string;
  password: string;
}

export const LoginArgumentsConfig = {
  email: String,
  password: String,
};

export interface LogoutArguments extends SubCommandArguments {
  email: string;
}

export const LogoutArgumentsConfig = {
  email: String,
};

export interface DeleteUserArguments extends SubCommandArguments {
  id: string;
}

export const DeleteUserArgumentsConfig = {
  id: String,
};

export interface EditUserArguments extends SubCommandArguments {
  id: string;
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

export const EditUserArgumentsConfig = {
  id: { type: String, optional: false as const },
  email: { type: String, optional: true as const },
  name: { type: String, optional: true as const },
  password: { type: String, optional: true as const },
  role: { type: parseUserRole, optional: true as const },
} as const;
