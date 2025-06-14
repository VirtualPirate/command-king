import * as vscode from "vscode";
import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createDeleteCommand(provider: CommandTreeProvider) {
  return async (node: CommandNode) => {
    const command = provider.getCommandByNode(node);
    if (!command) {
      return;
    }

    const result = await vscode.window.showWarningMessage(
      `Are you sure you want to delete the command "${command.key}"?`,
      "Delete",
      "Cancel"
    );

    if (result === "Delete") {
      provider.deleteCommand(node);
    }
  };
}
