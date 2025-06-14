import * as vscode from "vscode";
import * as path from "path";
import { CommandItem, CommandNode } from "../types";

export class CommandTreeProvider
  implements vscode.TreeDataProvider<CommandNode>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    CommandNode | undefined | null | void
  > = new vscode.EventEmitter<CommandNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CommandNode | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private commands: Map<string, CommandItem[]> = new Map();
  private packageJsonCommands: Map<string, CommandItem[]> = new Map();
  private treeData: CommandNode[] = [];

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.scanForCmdkFiles().then(() => {
      this.scanForPackageJsonFiles().then(() => {
        this.buildTreeData();
        this._onDidChangeTreeData.fire();
      });
    });
  }

  getTreeItem(element: CommandNode): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.label);

    if (element.isFile) {
      treeItem.contextValue = "cmdkFile";
      treeItem.iconPath = new vscode.ThemeIcon("folder");
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    } else if (element.command) {
      treeItem.contextValue = "command";
      treeItem.tooltip = `${element.command.command}`;
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
      // Set command to execute when clicked
      treeItem.command = {
        command: "commandKing.writeCommand",
        title: "Write to Terminal",
        arguments: [element],
      };
      treeItem.iconPath = new vscode.ThemeIcon("terminal");
    } else {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      treeItem.iconPath = new vscode.ThemeIcon("folder");
    }

    return treeItem;
  }

  getChildren(element?: CommandNode): Thenable<CommandNode[]> {
    if (!element) {
      if (this.treeData.length === 0) {
        // Return a placeholder node when no .cmdk files or package.json files are found
        const placeholderNode: CommandNode = {
          label: "No commands found",
          children: [
            {
              label: "Create a .cmdk file to get started",
            },
            {
              label: "Or ensure package.json has scripts",
            },
          ],
        };
        return Promise.resolve([placeholderNode]);
      }
      return Promise.resolve(this.treeData);
    }
    return Promise.resolve(element.children || []);
  }

  private async scanForCmdkFiles(): Promise<void> {
    this.commands.clear();

    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    for (const folder of vscode.workspace.workspaceFolders) {
      const cmdkFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, "**/*.cmdk"),
        "**/node_modules/**"
      );

      for (const file of cmdkFiles) {
        try {
          const content = await vscode.workspace.fs.readFile(file);
          const jsonContent = JSON.parse(content.toString());

          const commands: CommandItem[] = [];
          for (const [key, command] of Object.entries(jsonContent)) {
            if (typeof command === "string") {
              commands.push({
                key,
                command,
                filePath: file.fsPath,
              });
            }
          }

          this.commands.set(file.fsPath, commands);
        } catch (error) {
          console.error(`Error reading ${file.fsPath}:`, error);
        }
      }
    }

    // Set context for when we have .cmdk files
    vscode.commands.executeCommand(
      "setContext",
      "commandKingHasCmdkFiles",
      this.commands.size > 0
    );
  }

  private async scanForPackageJsonFiles(): Promise<void> {
    this.packageJsonCommands.clear();

    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    for (const folder of vscode.workspace.workspaceFolders) {
      const packageJsonFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, "package.json")
      );

      for (const file of packageJsonFiles) {
        try {
          const content = await vscode.workspace.fs.readFile(file);
          const jsonContent = JSON.parse(content.toString());

          if (jsonContent.scripts && typeof jsonContent.scripts === "object") {
            const commands: CommandItem[] = [];
            for (const [scriptName, scriptCommand] of Object.entries(
              jsonContent.scripts
            )) {
              if (typeof scriptCommand === "string") {
                commands.push({
                  key: scriptName,
                  command: `npm run ${scriptName}`,
                  filePath: file.fsPath,
                });
              }
            }

            if (commands.length > 0) {
              this.packageJsonCommands.set(file.fsPath, commands);
            }
          }
        } catch (error) {
          console.error(`Error reading ${file.fsPath}:`, error);
        }
      }
    }
  }

  private buildTreeData(): void {
    this.treeData = [];

    // Add .cmdk files
    for (const [filePath, commands] of this.commands) {
      const fileName = path.basename(filePath, ".cmdk");
      const fileNode: CommandNode = {
        label: fileName,
        isFile: true,
        filePath: filePath,
        children: [],
      };

      // Build hierarchical structure
      const rootGroups: Map<string, CommandNode> = new Map();

      for (const cmd of commands) {
        const parts = cmd.key.split("/");
        let currentLevel = rootGroups;
        let currentParent = fileNode;

        // Navigate/create the hierarchy
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isLastPart = i === parts.length - 1;

          if (isLastPart) {
            // This is the command itself
            const commandNode: CommandNode = {
              label: part,
              command: cmd,
            };
            currentParent.children!.push(commandNode);
          } else {
            // This is a group
            if (!currentLevel.has(part)) {
              const groupNode: CommandNode = {
                label: part,
                children: [],
              };
              currentLevel.set(part, groupNode);
              currentParent.children!.push(groupNode);
            }

            const groupNode = currentLevel.get(part)!;
            currentParent = groupNode;
            currentLevel = new Map();

            // Update currentLevel to point to the children of this group
            for (const child of groupNode.children!) {
              if (!child.command) {
                currentLevel.set(child.label, child);
              }
            }
          }
        }
      }

      this.treeData.push(fileNode);
    }

    // Add package.json files
    for (const [filePath, commands] of this.packageJsonCommands) {
      const fileName = "package.json";
      const fileNode: CommandNode = {
        label: fileName,
        isFile: true,
        filePath: filePath,
        children: [],
      };

      // Add all scripts as direct children (no hierarchy for package.json scripts)
      for (const cmd of commands) {
        const commandNode: CommandNode = {
          label: cmd.key,
          command: cmd,
        };
        fileNode.children!.push(commandNode);
      }

      this.treeData.push(fileNode);
    }
  }

  getCommandByNode(node: CommandNode): CommandItem | undefined {
    return node.command;
  }

  getFilePathByNode(node: CommandNode): string | undefined {
    if (!node) {
      return undefined;
    }
    return node.filePath;
  }

  getCommands(): Map<string, CommandItem[]> {
    const allCommands = new Map(this.commands);
    for (const [filePath, commands] of this.packageJsonCommands) {
      allCommands.set(filePath, commands);
    }
    return allCommands;
  }

  async deleteCommand(node: CommandNode): Promise<void> {
    if (!node.command) {
      return;
    }

    const filePath = node.command.filePath;
    const commandKey = node.command.key;

    // Check if this is a package.json file
    if (path.basename(filePath) === "package.json") {
      vscode.window.showWarningMessage(
        "Cannot delete package.json scripts from Command King. Edit package.json directly."
      );
      return;
    }

    try {
      const content = await vscode.workspace.fs.readFile(
        vscode.Uri.file(filePath)
      );
      const jsonContent = JSON.parse(content.toString());

      delete jsonContent[commandKey];

      const updatedContent = JSON.stringify(jsonContent, null, 2);
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        Buffer.from(updatedContent)
      );

      this.refresh();
      vscode.window.showInformationMessage(
        `Command "${commandKey}" deleted successfully`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to delete command: ${error}`);
    }
  }

  async editCommand(node: CommandNode): Promise<void> {
    if (!node.command) {
      return;
    }

    const filePath = node.command.filePath;
    const commandKey = node.command.key;
    const currentCommand = node.command.command;

    // Check if this is a package.json file
    if (path.basename(filePath) === "package.json") {
      vscode.window.showWarningMessage(
        "Cannot edit package.json scripts from Command King. Edit package.json directly."
      );
      return;
    }

    const newCommand = await vscode.window.showInputBox({
      prompt: `Edit command for "${commandKey}"`,
      value: currentCommand,
    });

    if (newCommand === undefined) {
      return; // User cancelled
    }

    try {
      const content = await vscode.workspace.fs.readFile(
        vscode.Uri.file(filePath)
      );
      const jsonContent = JSON.parse(content.toString());

      jsonContent[commandKey] = newCommand;

      const updatedContent = JSON.stringify(jsonContent, null, 2);
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        Buffer.from(updatedContent)
      );

      this.refresh();
      vscode.window.showInformationMessage(
        `Command "${commandKey}" updated successfully`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to update command: ${error}`);
    }
  }

  async addCommand(filePath?: string): Promise<void> {
    // Check if this is a package.json file
    if (filePath && path.basename(filePath) === "package.json") {
      vscode.window.showWarningMessage(
        "Cannot add commands to package.json from Command King. Edit package.json directly."
      );
      return;
    }

    // If no file path provided, let user choose or create a new .cmdk file
    let targetFilePath = filePath;

    if (!targetFilePath && this.commands.size > 0) {
      const fileOptions = Array.from(this.commands.keys()).map((fp) => ({
        label: path.basename(fp, ".cmdk"),
        detail: fp,
      }));

      fileOptions.push({
        label: "+ Create new .cmdk file",
        detail: "Create a new command file",
      });

      const selected = await vscode.window.showQuickPick(fileOptions, {
        placeHolder: "Select a .cmdk file to add the command to",
      });

      if (!selected) {
        return; // User cancelled
      }

      if (selected.label === "+ Create new .cmdk file") {
        const fileName = await vscode.window.showInputBox({
          prompt: "Enter name for the new .cmdk file (without extension)",
          validateInput: (value) => {
            if (!value || value.trim() === "") {
              return "File name cannot be empty";
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
              return "File name can only contain letters, numbers, hyphens, and underscores";
            }
            return null;
          },
        });

        if (!fileName) {
          return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage("No workspace folder found");
          return;
        }

        targetFilePath = path.join(
          workspaceFolder.uri.fsPath,
          `${fileName}.cmdk`
        );

        // Create empty .cmdk file
        await vscode.workspace.fs.writeFile(
          vscode.Uri.file(targetFilePath),
          Buffer.from("{}")
        );
      } else {
        targetFilePath = selected.detail;
      }
    } else if (!targetFilePath) {
      // Create first .cmdk file
      const fileName = await vscode.window.showInputBox({
        prompt: "Enter name for the new .cmdk file (without extension)",
        value: "commands",
      });

      if (!fileName) {
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      targetFilePath = path.join(
        workspaceFolder.uri.fsPath,
        `${fileName}.cmdk`
      );
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(targetFilePath),
        Buffer.from("{}")
      );
    }

    // Get command key and command
    const commandKey = await vscode.window.showInputBox({
      prompt:
        'Enter command key (e.g., "backend-api/build" or "database/seed")',
    });

    if (!commandKey) {
      return;
    }

    const command = await vscode.window.showInputBox({
      prompt: `Enter command for "${commandKey}"`,
    });

    if (!command) {
      return;
    }

    try {
      const content = await vscode.workspace.fs.readFile(
        vscode.Uri.file(targetFilePath)
      );
      const jsonContent = JSON.parse(content.toString());

      jsonContent[commandKey] = command;

      const updatedContent = JSON.stringify(jsonContent, null, 2);
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(targetFilePath),
        Buffer.from(updatedContent)
      );

      this.refresh();
      vscode.window.showInformationMessage(
        `Command "${commandKey}" added successfully`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to add command: ${error}`);
    }
  }
}
