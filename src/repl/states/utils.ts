import type {Interface} from "node:readline";
import type {State} from "../State.js";
import {singleCharQuestion} from "../utils.js";

export type Choice = { choiceCharacter: string, description: string, state: State }

export const defaultErrorMessage = "Invalid choice, pick from the options above.";

export async function promptForChoices(
  rl: Interface,
  choices: Choice[],
  error?: string,
  prompt: string = "Choice: ",
): Promise<State | undefined>
{
  for (const choice of choices) {
    rl.write(`${choice.choiceCharacter} - ${choice.description}\n`);
  }

  rl.write(`\n`);

  if (error) {
    rl.write(`${error}\n\n`);
  }

  const choice = await singleCharQuestion(rl, prompt);
  return choices.find(choiceCandidate => choiceCandidate.choiceCharacter === choice)?.state;
}