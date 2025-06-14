import * as vscode from "vscode";
import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createRunCommand(provider: CommandTreeProvider) {
  return async (node: CommandNode) => {
    const command = provider.getCommandByNode(node);
    if (!command) {
      return;
    }

    // Create terminal name with folder path using slashes
    const folderPath =
      command.path.length > 1
        ? command.path.slice(0, -1).join("/") + "/" + command.key
        : command.key;
    const terminalName = `Command King: ${folderPath}`;

    const terminal = vscode.window.createTerminal(terminalName);
    terminal.show();
    // Execute the command immediately
    terminal.sendText(command.command, true);
  };
}
