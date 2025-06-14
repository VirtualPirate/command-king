import * as vscode from "vscode";
import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createRunCommand(provider: CommandTreeProvider) {
  return async (node: CommandNode) => {
    const command = provider.getCommandByNode(node);
    if (!command) {
      return;
    }

    const terminal = vscode.window.createTerminal("Command King");
    terminal.show();
    // Execute the command immediately
    terminal.sendText(command.command, true);
  };
}
