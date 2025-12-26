import {questionAsync} from "../../../utils.js";
import type {Interface} from "node:readline";
import type {IOrder} from "../../../../types/index.js";
import {OrderService} from "../../../../features/orders/OrderService.js";

export async function getOrderByIdOrCancelAsync(rl: Interface): Promise<any | false> {
  rl.write("Provide the order ID to continue. Leave the field blank to go back.\n\n");
  
  const orderService = OrderService.instance;

  let orderId: string;
  while (true) {
    orderId = await questionAsync(rl, "Order ID: ");
    if (orderId === "") {
      return false;
    }

    // Valider et récupérer la commande par ID
    try {
      const order = await orderService.getOrderById(orderId.trim());
      
      if (order) {
        return order;
      } else {
        rl.write("❌ Order not found. Please try again.\n\n");
      }
    } catch (error) {
      rl.write(`❌ Error: ${error instanceof Error ? error.message : String(error)}\n\n`);
    }
  }
}