import * as vscode from "vscode";
import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createShowKebabMenuCommand(provider: CommandTreeProvider) {
  return async (node: CommandNode) => {
    const command = provider.getCommandByNode(node);
    if (!command) {
      return;
    }

    const options = [
      {
        label: "$(play) Run",
        description: "Execute the command in terminal",
        action: "run",
      },
      {
        label: "$(edit) Edit",
        description: "Edit the command",
        action: "edit",
      },
      {
        label: "$(trash) Delete",
        description: "Delete the command",
        action: "delete",
      },
    ];

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: `Actions for "${command.key}"`,
      matchOnDescription: true,
      canPickMany: false,
    });

    if (!selected) {
      return;
    }

    switch (selected.action) {
      case "run":
        vscode.commands.executeCommand("commandKing.runCommand", node);
        break;
      case "edit":
        vscode.commands.executeCommand("commandKing.editCommand", node);
        break;
      case "delete":
        vscode.commands.executeCommand("commandKing.deleteCommand", node);
        break;
    }
  };
}
