import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {questionAsync, readChar} from "../../utils.js";
import {AccountState} from "../index.js";
import {SessionService} from "../../../features/auth/SessionService.js";

export class AccountSignInOutState implements State {
  public static instance: AccountSignInOutState = new AccountSignInOutState();

  private authService: AuthService;
  private sessionService: SessionService;
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (this.sessionService.isLoggedIn()) {
      rl.write("Confirm logging out by typing 'Y' (anything else will cancel the operation).\n\n");
      rl.write("> ");

      const confirmation = readChar();
      if (confirmation.toLowerCase() === "y") {
        this.sessionService.deleteSession();
        rl.write("\n\n");
        rl.write("Successfully logged out. Press anything to go back to the Account page.\n\n");
        readChar();
      }

      return AccountState.instance;
    }

    rl.write("Signing in. Leave the field blank to go back.\n\n")
    const email = await questionAsync(rl, "Email: ");
    if (email === "") {
      return AccountState.instance;
    }

    const password = await questionAsync(rl, "Password: ");
    if (password === "") {
      return AccountState.instance;
    }

    rl.write("\n");

    const result = await this.authService.login(email, password);

    if (result) {
      rl.write("Successfully logged in. Press anything to go back to the Account page.\n\n");
    } else {
      rl.write("Invalid credentials. The log in operation was cancelled. Press anything to go back to the Account page.\n\n");
    }

    readChar();
    return AccountState.instance;
  }
}