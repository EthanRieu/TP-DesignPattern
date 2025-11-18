import { AuthService } from './features/auth/AuthService.js';
import { parseArgs } from './cli/index.js';
import Commands from './cli/commands.js';
import type { LoginArguments } from './cli/sub-command-arguments/users.js';

const message: string = 'Hello TypeScript 🔁';
console.log(message);
console.log(parseArgs(process.argv));

async function main() {
  const { command, arguments: commandArgs } = parseArgs(process.argv);

  switch (command) {
    case Commands.Login: {
      const { email, password } = commandArgs as LoginArguments;
      const user = await AuthService.login(email, password);
      console.log('User:', user);
      break;
    }
    default:
      console.error(`Commande non prise en charge: ${command}`);
      process.exitCode = 1;
  }
}

main();
