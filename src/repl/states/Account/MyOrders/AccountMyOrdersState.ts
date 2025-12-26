import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../../features/auth/AuthService.js";
import {OrderService} from "../../../../features/orders/OrderService.js";
import {consoleTable, readChar} from "../../../utils.js";
import {
  AccountMyOrdersDeleteState,
  AccountMyOrdersEditState,
  AccountMyOrdersGetState,
  AccountState,
  type Choice,
  defaultErrorMessage,
  promptForChoices
} from "../../index.js";
import {SessionService} from "../../../../features/auth/SessionService.js";

export class AccountMyOrdersState implements State {
  public static instance: AccountMyOrdersState = new AccountMyOrdersState();

  private isInvalidChoice = false;
  private authService: AuthService;
  private sessionService: SessionService;
  private orderService: OrderService;
  
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
    this.orderService = OrderService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (!this.sessionService.isLoggedIn()) {
      rl.write("You need to be logged in before accessing your orders.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    rl.write("My orders page:\n");

    const session = this.sessionService.getSession();
    if (!session) {
      rl.write("Error: Could not retrieve session.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    // Récupérer les vraies commandes de l'utilisateur depuis la DB
    const userOrders = await this.orderService.getUserOrders(session.userId);
    
    if (userOrders.length === 0) {
      rl.write("\n📦 You have no orders yet.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    // Formater les commandes pour l'affichage
    const orders = userOrders.map(order => ({
      id: order.id,
      total: order.total,
      itemCount: (order as any).items?.length ?? 0,
      shippingAddress: order.shippingAddress,
      status: order.status,
      paymentMethod: order.paymentMethod
    }));

    consoleTable(orders, "id");

    const choices: Choice[] = [
      {
        choiceCharacter: '1',
        description: 'Get order details',
        state: AccountMyOrdersGetState.instance
      },
      {
        choiceCharacter: '2',
        description: 'Cancel order',
        state: AccountMyOrdersDeleteState.instance
      },
      {
        choiceCharacter: '3',
        description: 'Back to account page',
        state: AccountState.instance
      },
    ];

    const newState = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    this.isInvalidChoice = newState === undefined;
    return newState ? newState : AccountMyOrdersState.instance;
  }
}