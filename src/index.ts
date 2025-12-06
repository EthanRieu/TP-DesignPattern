import { AuthService } from './features/auth/AuthService.js';
import { parseArgs } from './cli/index.js';
import Commands from './cli/commands.js';
import type {
  CreateUserArguments,
  LoginArguments,
  LogoutArguments,
  DeleteUserArguments,
  GetUserByIdArguments,
  EditUserArguments,
} from './cli/sub-command-arguments/users.js';
import type { IUserUpdate } from './types/index.js';

const message: string = 'Hello TypeScript 🔁';
console.log(message);
console.log(parseArgs(process.argv));

async function main() {
  const { command, arguments: commandArgs } = parseArgs(process.argv);

  switch (command) {
    /** AuthService commands **/
    case Commands.GetUsers: {
      const users = await AuthService.getUsers();
      console.log('Users:', users);
      break;
    }
    case Commands.GetUserById: {
      const { id } = commandArgs as GetUserByIdArguments;
      const user = await AuthService.getUserById(id);
      console.log('User:', user);
      break;
    }
    case Commands.Login: {
      const { email, password } = commandArgs as LoginArguments;
      const user = await AuthService.login(email, password);
      console.log('User:', user);
      break;
    }
    case Commands.Logout: {
      const { email } = commandArgs as LogoutArguments;
      await AuthService.logout(email);
      break;
    }
    case Commands.CreateUser: {
      const { email, name, password, role } =
        commandArgs as CreateUserArguments;
      const user = await AuthService.createUser({
        email,
        name,
        password,
        role,
      });
      console.log('User:', user);
      break;
    }
    case Commands.EditUser: {
      const { id, email, name, password, role } =
        commandArgs as EditUserArguments;
      if (!id) {
        console.error('❌ Error: id is required for edit-user command');
        process.exitCode = 1;
        break;
      }
      const updateData: IUserUpdate = { id };
      if (email !== undefined) updateData.email = email;
      if (name !== undefined) updateData.name = name;
      if (password !== undefined) updateData.password = password;
      if (role !== undefined) updateData.role = role;

      const user = await AuthService.updateUser(updateData);
      console.log('User:', user);
      break;
    }
    case Commands.DeleteUser: {
      const { id } = commandArgs as DeleteUserArguments;
      await AuthService.deleteUser(id);
      break;
    }
    default:
      console.error(`Commande non prise en charge: ${command}`);
      process.exitCode = 1;
  }
}

main();
