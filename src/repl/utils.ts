import type {Interface} from "node:readline";

export async function questionAsync(rl: Interface, query: string): Promise<string> {
  return await new Promise(resolve => rl.question(query, resolve))
}