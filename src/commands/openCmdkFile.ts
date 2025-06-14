import * as vscode from "vscode";
import * as path from "path";
import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createOpenCmdkFileCommand(provider: CommandTreeProvider) {
  return async (node: CommandNode) => {
    let filePath: string | undefined;

    if (node) {
      filePath = provider.getFilePathByNode(node);
    }

    // If we don't have a file path from the node, let user choose
    if (!filePath) {
      const cmdkFiles = Array.from(provider.getCommands().keys());

      if (cmdkFiles.length === 0) {
        vscode.window.showErrorMessage("No .cmdk files found in workspace");
        return;
      }

      if (cmdkFiles.length === 1) {
        filePath = cmdkFiles[0];
      } else {
        const fileOptions = cmdkFiles.map((fp: string) => ({
          label: path.basename(fp, ".cmdk"),
          detail: fp,
        }));

        const selected = await vscode.window.showQuickPick(fileOptions, {
          placeHolder: "Select a .cmdk file to open",
        });

        if (!selected) {
          return;
        }

        filePath = selected.detail;
      }
    }

    if (filePath) {
      vscode.window.showTextDocument(vscode.Uri.file(filePath));
    } else {
      vscode.window.showErrorMessage("Could not determine file path");
    }
  };
}
