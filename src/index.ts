import { AuthService } from './features/auth/AuthService.js';
import { ProductService } from './features/catalog/ProductService.js';
import { parseArgs } from './cli/index.js';
import { replLoop } from './repl/repl.js';
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
import type { CreateProductArguments, DeleteProductArguments, GetFilteredProductsArguments, GetProductByIdArguments, UpdateProductArguments } from './cli/sub-command-arguments/catalog.js';

const message: string = 'Hello TypeScript 🔁';
console.log(message);
console.log(parseArgs(process.argv));

async function main() {
  const authService = AuthService.instance;
  const productService = ProductService.instance;

  const { command, arguments: commandArgs } = parseArgs(process.argv);

  switch (command) {
    /** AuthService commands **/
    case Commands.GetUsers: {
      const users = await authService.getUsers();
      console.log('Users:', users);
      break;
    }
    case Commands.GetUserById: {
      const { id } = commandArgs as GetUserByIdArguments;
      const user = await authService.getUserById(id);
      console.log('User:', user);
      break;
    }
    case Commands.Login: {
      const { email, password } = commandArgs as LoginArguments;
      const user = await authService.login(email, password);
      console.log('User:', user);
      break;
    }
    case Commands.Logout: {
      const { email } = commandArgs as LogoutArguments;
      await authService.logout(email);
      break;
    }
    case Commands.CreateUser: {
      const { email, name, password, role } =
        commandArgs as CreateUserArguments;
      const user = await authService.createUser({
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

      const user = await authService.updateUser(updateData);
      console.log('User:', user);
      break;
    }
    case Commands.DeleteUser: {
      const { id } = commandArgs as DeleteUserArguments;
      await authService.deleteUser(id);
      break;
    }
    case Commands.Repl: {
      await replLoop();
      process.exit(0);
    }

    //Catalog Commands
    case Commands.GetProducts: {
      const products = await productService.getAllProducts();
      console.log('Products:', products);
      break;
    }

    case Commands.GetProductById: {
      const { id } = commandArgs as GetProductByIdArguments;
      const product = await productService.getProductById(id);
      console.log('Product:', product);
      break;
    }

    case Commands.GetFilteredProducts: {
      const { category } = commandArgs as GetFilteredProductsArguments;
      const products = await productService.getFilteredProducts(category);
      console.log('Products:', products);
      break;
    }

    case Commands.CreateProduct: {
      const { name, description, price, stock, category } =
        commandArgs as CreateProductArguments;
      const product = await productService.createProduct({
        name,
        description,
        price,
        stock,
        category,
      });
      console.log('Product:', product);
      break;
    }

    case Commands.UpdateProduct: {
      const { id, name, description, price, stock, category } =
        commandArgs as UpdateProductArguments;

      const data: any = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = price;
      if (stock !== undefined) data.stock = stock;
      if (category !== undefined) data.category = category;

      const product = await productService.updateProduct(id, data);
      console.log('Product:', product);
      break;
    }
    case Commands.DeleteProduct: {
      const { id } = commandArgs as DeleteProductArguments;
      const product = await productService.deleteProduct(id);
      console.log('Product:', product);
      break;
    }
    default:
      console.error(`Commande non prise en charge: ${command}`);
      process.exitCode = 1;
  }
}

main();
