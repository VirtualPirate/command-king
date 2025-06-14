import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createEditCommand(provider: CommandTreeProvider) {
  return (node: CommandNode) => {
    provider.editCommand(node);
  };
}
