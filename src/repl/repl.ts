import * as readline from "node:readline";
import {AuthService} from "../features/auth/AuthService.js";
import {HomeState} from "./HomeState.js";
import {ExitState} from "./ExitState.js";
import {questionAsync} from "./utils.js";
import type {State} from "./state.js";

export async function replLoop() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.write("Welcome to the ordering app!\n");
  rl.write("Please login before continuing.\n");


  do {
    const name = await questionAsync(rl, "User name: ");
    const password = await questionAsync(rl, "Password: ");

    // TODO: change this to something like this: if (AuthService.auth(name, password)) { break; }
    break;

    console.log("Invalid credentials");
  } while (true)

  console.clear();

  let state: State = HomeState.instance;

  do {
    state = await state.printAndRead(rl);
  } while (!(state instanceof ExitState))
}
