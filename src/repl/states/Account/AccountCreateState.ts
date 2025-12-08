import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {emailRegex, questionAsync, readChar} from "../../utils.js";
import {AccountState} from "../index.js";
import {SessionService} from "../../../features/auth/SessionService.js";
import type {UserRole} from "../../../types/index.js";

export class AccountCreateState implements State {
  public static instance: AccountCreateState = new AccountCreateState();

  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (this.sessionService.isLoggedIn()) {
      rl.write("Please log out before creating a new Account\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    rl.write("Creating an account. Leave the field blank to go back.\n\n")

    let email: string;
    while (true) {
      email = await questionAsync(rl, "Email: ");
      if (email === "") {
        return AccountState.instance;
      }
      if (emailRegex.test(email)) {
        break;
      }
      rl.write("Invalid email provided.\n\n");
    }

    const name = await questionAsync(rl, "User name: ");
    if (name === "") {
      return AccountState.instance;
    }

    const password = await questionAsync(rl, "Password: ");
    if (password === "") {
      return AccountState.instance;
    }

    const role: UserRole = "CUSTOMER";

    rl.write("\n")

    try {
      const result = this.authService.createUser({
        email,
        password,
        name,
        role
      });

      rl.write("Account successfully created!\n");
      rl.write("You can now log in using that account\n\n");
    }
    catch (error) {
      rl.write(`Error during account creation: ${error}\n`);
    }

    rl.write("Press anything to go back to the Account page.\n");
    await readChar();
    return AccountState.instance;
  }

}