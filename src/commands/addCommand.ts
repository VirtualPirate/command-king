import { CommandNode } from "../types";
import { CommandTreeProvider } from "../providers/commandTreeProvider";

export function createAddCommand(provider: CommandTreeProvider) {
  return (node?: CommandNode) => {
    let filePath: string | undefined;
    if (node?.isFile) {
      filePath = node.filePath;
    }
    provider.addCommand(filePath);
  };
}
