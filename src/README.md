# Command King - Source Code Structure

This document describes the organized structure of the Command King VS Code extension source code.

## Directory Structure

```
src/
├── extension.ts              # Main extension entry point
├── types.ts                  # Type definitions and interfaces
├── providers/               # Data providers
│   └── commandTreeProvider.ts
├── commands/               # Command handlers
│   ├── index.ts           # Exports all commands
│   ├── writeCommand.ts    # Write command to terminal
│   ├── runCommand.ts      # Execute command in terminal
│   ├── editCommand.ts     # Edit existing commands
│   ├── deleteCommand.ts   # Delete commands with confirmation
│   ├── addCommand.ts      # Add new commands
│   ├── openCmdkFile.ts    # Open .cmdk files
│   └── showKebabMenu.ts   # Show action menu
└── test/                  # Test files
```

## Architecture Overview

### 1. **extension.ts** (Main Entry Point)

- Extension activation and deactivation
- Command registration
- File watchers setup
- Clean and focused on orchestration

### 2. **types.ts** (Type Definitions)

- `CommandItem` interface: Represents a single command
- `CommandNode` interface: Represents tree view nodes
- Shared across all modules

### 3. **providers/** (Data Providers)

- **commandTreeProvider.ts**: Manages the tree view data
  - Scans for .cmdk and package.json files
  - Builds hierarchical tree structure
  - Handles file operations (add, edit, delete)

### 4. **commands/** (Command Handlers)

- **index.ts**: Central export point for all commands
- Individual command files with factory functions:
  - Each command handler is a factory function that takes the provider
  - Returns the actual command implementation
  - Promotes testability and modularity

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single responsibility
2. **Maintainability**: Easier to locate and modify specific functionality
3. **Testability**: Individual components can be tested in isolation
4. **Scalability**: Easy to add new commands or providers
5. **Readability**: Code is organized logically and easier to understand

## Usage

The main extension file imports everything it needs:

```typescript
import { CommandTreeProvider } from "./providers/commandTreeProvider";
import {
  createWriteCommand,
  createRunCommand,
  // ... other commands
} from "./commands";
```

Command handlers are created using factory functions:

```typescript
const writeCommand = vscode.commands.registerCommand(
  "commandKing.writeCommand",
  createWriteCommand(provider)
);
```

This pattern allows for dependency injection and better testability.
