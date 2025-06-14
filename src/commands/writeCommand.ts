import * as vscode from "vscode";
import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createWriteCommand(provider: CommandTreeProvider) {
  return async (node: CommandNode) => {
    const command = provider.getCommandByNode(node);
    if (!command) {
      return;
    }

    const terminal = vscode.window.createTerminal(command.key);
    terminal.show();
    // Write the command without executing it - user needs to press Enter
    terminal.sendText(command.command, false);
  };
}
