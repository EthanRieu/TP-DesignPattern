import * as readline from "node:readline";
import {HomeState, ExitState} from "./states/index.js";
import type {State} from "./State.js";

export async function replLoop() {
  const exitMessage = "Exiting... Thank you for using our ordering application\n\n";

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", async () => {
    rl.write("\n\nExit requested.\n");
    rl.write(exitMessage);
    process.exit(0);
  })

  // Utilisation du pattern "State":
  // A chaque itération, l'instance de state actuelle va retourner une
  // nouvelle State qui déterminera l'état actuel de l'application
  // Chaque state utilise aussi le pattern Singleton pour ne pas
  // pouvoir en créer plusieurs instances.
  let state: State = HomeState.instance;
  do {
    console.clear();
    state = await state.printAndRead(rl);
  } while (!(state instanceof ExitState))

  rl.write("\n");
  rl.write(exitMessage);
}
