import {questionAsync} from "../../../utils.js";
import type {Interface} from "node:readline";
import type {IOrder} from "../../../../types/index.js";

export async function getOrderByIdOrCancelAsync(rl: Interface): Promise<IOrder | false> {
  rl.write("Provide the order ID to continue. Leave the field blank to go back.\n\n")

  let orderId: string;
  while (true) {
    orderId = await questionAsync(rl, "Order ID: ");
    if (orderId === "") {
      return false;
    }

    if (true) {
      rl.write("TODO: validate and get order by ID\n")
      // return the order
      return false;
    }

    rl.write("Invalid order ID provided.\n\n");
  }
}