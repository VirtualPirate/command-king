# Command King

Command King is a VS Code extension that allows you to manage and execute custom commands from `.cmdk` files in your workspace. It provides a hierarchical tree view for organizing commands and quick execution through the integrated terminal.

## Features

- **Automatic Discovery**: Scans your workspace for `.cmdk` files and `package.json` files automatically
- **Package.json Scripts**: Automatically includes npm scripts from package.json files in the command tree
- **Hierarchical Organization**: Commands are organized in a tree structure based on their keys (using `/` as separator)
- **Quick Execution**: Run commands directly in VS Code's integrated terminal
- **CRUD Operations**: Add, edit, and delete commands through the UI (read-only for package.json scripts)
- **Real-time Updates**: File watcher automatically refreshes the view when `.cmdk` files or `package.json` files change
- **Multiple Files**: Support for multiple `.cmdk` files and multiple `package.json` files in your workspace

## Usage

### Package.json Scripts

Command King automatically discovers and displays npm scripts from any `package.json` files in your workspace. The scripts are displayed under a "package.json" node and can be executed directly. These scripts are read-only (you cannot edit or delete them from Command King - edit the `package.json` file directly).

### Creating .cmdk Files

Create `.cmdk` files in your workspace with JSON content mapping command keys to shell commands:

```json
{
  "backend-api/build": "npm run build",
  "backend-api/run": "npm run dev",
  "database/seed": "npm run db:seed",
  "database/migrate": "npm run db:migrate",
  "database/others/data-only": "npm run db:data-only",
  "docker/up": "docker-compose up -d",
  "docker/down": "docker-compose down",
  "random_command": "echo 'Hello World!'"
}
```

### Tree View Structure

Commands are organized hierarchically in the Command King explorer panel:

```
commands.cmdk
├── backend-api
│   ├── build
│   └── run
├── database
│   ├── seed
│   ├── migrate
│   └── others
│       └── data-only
├── docker
│   ├── up
│   └── down
└── random_command

package.json
├── vscode:prepublish
├── compile
├── watch
├── package
├── check-types
├── lint
└── test
```

### Available Actions

#### For Commands:

- **Run**: Execute the command in the integrated terminal
- **Edit**: Modify the command text
- **Delete**: Remove the command from the file

#### For Files:

- **Open**: Open the `.cmdk` file in the editor
- **Add Command**: Add a new command to the specific file

#### Global Actions:

- **Refresh**: Manually refresh the command tree
- **Add Command**: Add a command to any existing file or create a new `.cmdk` file

## Commands

The extension provides the following VS Code commands:

- `commandKing.refreshCommands`: Refresh the command tree
- `commandKing.runCommand`: Run a selected command
- `commandKing.editCommand`: Edit a selected command
- `commandKing.deleteCommand`: Delete a selected command
- `commandKing.addCommand`: Add a new command
- `commandKing.openCmdkFile`: Open a .cmdk file

## Installation

1. Package the extension: `npm run package`
2. Install the generated `.vsix` file in VS Code
3. The extension will automatically activate when VS Code starts

## Development

### Prerequisites

- Node.js
- pnpm (or npm)
- VS Code

### Setup

```bash
# Install dependencies
pnpm install

# Compile the extension
pnpm run compile

# Watch for changes during development
pnpm run watch

# Run tests
pnpm test
```

### Testing the Extension

1. Press `F5` to open a new Extension Development Host window
2. Create a `.cmdk` file in your test workspace
3. The Command King panel should appear in the Explorer sidebar
4. Test the various features (run, edit, delete, add commands)

## File Format

`.cmdk` files use JSON format with the following structure:

```json
{
  "command-key": "shell command to execute",
  "group/subcommand": "another command",
  "nested/deep/command": "deeply nested command"
}
```

- **Keys**: Can contain forward slashes (`/`) to create hierarchical organization
- **Values**: Must be strings containing the shell commands to execute
- **File Extension**: Must be `.cmdk`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This extension is provided as-is for educational and development purposes.
