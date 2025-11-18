import { AuthService } from './features/auth/AuthService.js';

const message: string = 'Hello TypeScript 🔁';
console.log(message);

async function main() {
  const users = await AuthService.getUsers();
  console.log('Users:', users);
}

main();
