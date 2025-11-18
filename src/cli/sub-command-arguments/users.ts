import type { SubCommandArguments } from "./sub-command-arguments.js";
import type {ArgumentConfig, OptionalPropertyOptions} from "ts-command-line-args";

export interface GetUsersArguments extends SubCommandArguments {}

export const GetUsersArgumentsConfig = {}

export interface CreateUserArguments extends SubCommandArguments {
  name: string;
  age: number;
  email: string;
}

export const CreateUserArgumentsConfig = {
  name: String,
  age: Number,
  email: { type: String, optional: true },
}
