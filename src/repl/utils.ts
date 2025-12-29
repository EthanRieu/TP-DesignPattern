import type {Interface} from "node:readline";

export async function questionAsync(rl: Interface, query: string): Promise<string> {
  return await new Promise(resolve => rl.question(query, resolve))
}

export async function singleCharQuestion(rl: Interface, query: string): Promise<string> {
  rl.write(query);
  return await readChar();
}

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function readChar(): Promise<string> {
  let character = "";

  const characterReader = (data: string) => {
    character += data;
  };

  // Hook into process.stdin data event, get a single character, deregister the hook and return the character
  process.stdin.addListener("data", characterReader);
  while (character === "") {
    await delay(100);
  }
  process.stdin.removeListener("data", characterReader);

  return character;
}

// Hackish way to get a table with the first '(index)' column removed
export function consoleTable(items: any, firstColumnName: string) {
  // Convert the array to an object so that console.table replaces the first column values with our own
  // (this still keeps the column name to (index) though
  const transformed = items.reduce((acc: any, {[firstColumnName]: name, ...x}) => { acc[name] = x; return acc}, {})

  // Replace the stdout write function to intercept the console.table output
  const originalStdoutWrite = process.stdout.write;

  let tableOutput = "";
  process.stdout.write = (buffer, _cb): boolean => {
    tableOutput += buffer;
    return true;
  };

  console.table(transformed);

  // Restore the original stdout write function
  process.stdout.write = originalStdoutWrite;

  const indexRegex = /\(index\)\s*/;
  const match = tableOutput.match(indexRegex)![0]!; // There should be no way this fails

  let computedFirstColumnName;
  if (firstColumnName.length > match.length) {
    // Shorten the column name
    computedFirstColumnName = firstColumnName.substring(0, match.length - 4) + "... ";
  } else {
    // Pad the column name with extra space if needed to keep the table borders aligned
    computedFirstColumnName = firstColumnName.padEnd(match.length, ' ');
  }

  // Finally, replace the (index) column name with the one we just computed
  tableOutput = tableOutput.replace(indexRegex, computedFirstColumnName);
  console.log(tableOutput);
}

export function capitalize(str: string) {
  if (str.length < 2) {
    return str.toUpperCase();
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
