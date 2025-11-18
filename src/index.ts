import { AuthService } from './features/auth/AuthService.js';
import {parseArgs} from "./cli/index.js";

const message: string = 'Hello TypeScript 🔁';
console.log(message);
// console.log(parseArgs(process.argv));



async function main() {
  const users = await AuthService.getUsers();
  console.log('Users:', users);
}

main();