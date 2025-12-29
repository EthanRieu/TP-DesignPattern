import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyOrdersState} from "./AccountMyOrdersState.js";
import {getOrderByIdOrCancelAsync} from "./utils.js";
import {OrderService} from "../../../../features/orders/OrderService.js";

export class AccountMyOrdersDeleteState implements State {
  public static instance: AccountMyOrdersDeleteState = new AccountMyOrdersDeleteState();

  private orderService: OrderService;

  private constructor() {
    this.orderService = OrderService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Cancel Order page: \n");

    const orderOrCancel = await getOrderByIdOrCancelAsync(rl);
    if (!orderOrCancel) {
      return AccountMyOrdersState.instance;
    }

    const order = orderOrCancel as any;

    // Afficher les détails de la commande
    rl.write("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    rl.write("⚠️  CANCEL ORDER\n");
    rl.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
    
    rl.write(`Order ID:         ${order.id}\n`);
    rl.write(`Status:           ${order.status}\n`);
    rl.write(`Total:            $${order.total.toFixed(2)}\n`);
    rl.write(`Shipping Address: ${order.shippingAddress}\n\n`);

    if (order.status !== 'PENDING') {
      rl.write(`❌ Cannot cancel order with status "${order.status}".\n`);
      rl.write(`Only orders with status "PENDING" can be cancelled.\n\n`);
      rl.write("Press anything to go back to the orders page.\n");
      await readChar();
      return AccountMyOrdersState.instance;
    }

    rl.write("Confirm cancellation by typing 'Y' (anything else will cancel the operation).\n\n");
    rl.write("> ");

    const confirmation = await readChar();

    if (confirmation.toLowerCase() === "y") {
      try {
        await this.orderService.cancelOrder(order.id);
        rl.write("\n\n");
        rl.write("✅ Successfully cancelled order.\n");
        rl.write("   The stock has been restored.\n\n");
      } catch (error) {
        rl.write("\n\n");
        rl.write(`❌ Error cancelling order: ${error instanceof Error ? error.message : String(error)}\n\n`);
      }
    } else {
      rl.write("\n\n");
      rl.write("❌ Cancellation aborted.\n\n");
    }

    rl.write("Press anything to go back to the orders page.\n");
    await readChar();

    return AccountMyOrdersState.instance;
  }
}