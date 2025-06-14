// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CommandTreeProvider } from "./providers/commandTreeProvider";
import {
  createWriteCommand,
  createRunCommand,
  createEditCommand,
  createDeleteCommand,
  createAddCommand,
  createOpenCmdkFileCommand,
  createShowKebabMenuCommand,
} from "./commands";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("Command King extension is now active!");

  const provider = new CommandTreeProvider();
  const treeView = vscode.window.createTreeView("commandKingExplorer", {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  // Register commands
  const refreshCommand = vscode.commands.registerCommand(
    "commandKing.refreshCommands",
    () => {
      provider.refresh();
    }
  );

  const writeCommand = vscode.commands.registerCommand(
    "commandKing.writeCommand",
    createWriteCommand(provider)
  );

  const runCommand = vscode.commands.registerCommand(
    "commandKing.runCommand",
    createRunCommand(provider)
  );

  const editCommand = vscode.commands.registerCommand(
    "commandKing.editCommand",
    createEditCommand(provider)
  );

  const deleteCommand = vscode.commands.registerCommand(
    "commandKing.deleteCommand",
    createDeleteCommand(provider)
  );

  const addCommand = vscode.commands.registerCommand(
    "commandKing.addCommand",
    createAddCommand(provider)
  );

  const openCmdkFile = vscode.commands.registerCommand(
    "commandKing.openCmdkFile",
    createOpenCmdkFileCommand(provider)
  );

  const showKebabMenu = vscode.commands.registerCommand(
    "commandKing.showKebabMenu",
    createShowKebabMenuCommand(provider)
  );

  // Watch for file changes
  const cmdkWatcher = vscode.workspace.createFileSystemWatcher("**/*.cmdk");
  cmdkWatcher.onDidChange(() => provider.refresh());
  cmdkWatcher.onDidCreate(() => provider.refresh());
  cmdkWatcher.onDidDelete(() => provider.refresh());

  const packageJsonWatcher =
    vscode.workspace.createFileSystemWatcher("**/package.json");
  packageJsonWatcher.onDidChange(() => provider.refresh());
  packageJsonWatcher.onDidCreate(() => provider.refresh());
  packageJsonWatcher.onDidDelete(() => provider.refresh());

  context.subscriptions.push(
    treeView,
    refreshCommand,
    writeCommand,
    runCommand,
    editCommand,
    deleteCommand,
    addCommand,
    openCmdkFile,
    showKebabMenu,
    cmdkWatcher,
    packageJsonWatcher
  );

  // Initial refresh
  provider.refresh();
}

// This method is called when your extension is deactivated
export function deactivate() {}
