import { parse } from 'ts-command-line-args';
import type {SubCommandArguments} from "./sub-command-arguments/index.js";
import Commands from "./commands.js";
import {
  type CreateUserArguments,
  CreateUserArgumentsConfig,
  type GetUsersArguments,
  GetUsersArgumentsConfig
} from "./sub-command-arguments/users.js";
import {type GetOrdersArguments, GetOrdersArgumentsConfig} from "./sub-command-arguments/orders.js";
import * as path from "node:path";

export function parseArgs(cliArgs: string[]): { command: string, arguments: SubCommandArguments } {
  if (cliArgs.length < 3) {
    console.error("Missing required command parameter.");
    process.exit(1);
  }

  const commandName = cliArgs[2]!;

  if (!(Object.values(Commands) as string[]).includes(commandName)) {
    console.error("Invalid command parameter.\nValid command parameters:");
    for (const commandsKey in Commands) {
      console.error(" - " + Commands[commandsKey as keyof typeof Commands]);
    }
    console.error(`\nUsage: ${path.basename(cliArgs[1]!)} (command) (arguments)`)
    process.exit(1);
  }

  const command = commandName as Commands;
  const rawCommandArguments = cliArgs.slice(3);
  const helpArgumentConfig = { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' };

  let args: SubCommandArguments;
  switch (command) {
    case Commands.GetOrders:
      args = parse<GetOrdersArguments>(GetOrdersArgumentsConfig, {argv: rawCommandArguments });
      break;
    case Commands.GetUsers:
      args = parse<GetUsersArguments>(GetUsersArgumentsConfig, {argv: rawCommandArguments });
      break;
    case Commands.CreateUser:
      args = parse<CreateUserArguments>(CreateUserArgumentsConfig, {argv: rawCommandArguments });
  }

  return { command, arguments: args };
}
