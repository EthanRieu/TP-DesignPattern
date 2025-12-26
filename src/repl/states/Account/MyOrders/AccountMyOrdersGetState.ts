import type {State} from "../../../State.js";
import type {Interface} from "node:readline";
import {readChar} from "../../../utils.js";
import {AccountMyOrdersState} from "./AccountMyOrdersState.js";
import {getOrderByIdOrCancelAsync} from "./utils.js";

export class AccountMyOrdersGetState implements State {
  public static instance: AccountMyOrdersGetState = new AccountMyOrdersGetState();

  private isInvalidChoice = false;
  private constructor() {}

  async printAndRead(rl: Interface): Promise<State> {
    rl.write("Order details page: \n");

    const orderOrCancel = await getOrderByIdOrCancelAsync(rl);
    if (!orderOrCancel) {
      return AccountMyOrdersState.instance;
    }

    const order = orderOrCancel as any; // Type assertion car Prisma include change le type

    // Afficher les détails de la commande
    rl.write("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    rl.write("📦 ORDER DETAILS\n");
    rl.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
    
    rl.write(`Order ID:         ${order.id}\n`);
    rl.write(`Status:           ${order.status}\n`);
    rl.write(`Total:            $${order.total.toFixed(2)}\n`);
    rl.write(`Payment Method:   ${order.paymentMethod}\n`);
    rl.write(`Shipping Address: ${order.shippingAddress}\n`);
    rl.write(`Created At:       ${new Date(order.createdAt).toLocaleString()}\n`);
    
    rl.write("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    rl.write("📋 ORDER ITEMS\n");
    rl.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any, index: number) => {
        rl.write(`${index + 1}. ${item.product.name}\n`);
        rl.write(`   Price:    $${item.price.toFixed(2)}\n`);
        rl.write(`   Quantity: ${item.quantity}\n`);
        rl.write(`   Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`);
      });
    } else {
      rl.write("No items in this order.\n\n");
    }

    rl.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

    rl.write("Press anything to go back to the orders page.\n");
    await readChar();

    return AccountMyOrdersState.instance;
  }
}