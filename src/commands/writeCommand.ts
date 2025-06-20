import * as vscode from "vscode";
import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createWriteCommand(provider: CommandTreeProvider) {
  return async (node: CommandNode) => {
    const command = provider.getCommandByNode(node);
    if (!command) {
      return;
    }

    // Try to get the active terminal first
    let terminal = vscode.window.activeTerminal;
    // If no active terminal exists, create a new one
    if (!terminal) {
      // Create terminal name with folder path using slashes
      const folderPath =
        command.path.length > 1
          ? command.path.slice(0, -1).join("/") + "/" + command.key
          : command.key;
      const terminalName = folderPath;

      terminal = vscode.window.createTerminal(terminalName);
    }

    terminal.show();
    // Write the command without executing it - user needs to press Enter
    terminal.sendText(command.command, false);
  };
}
