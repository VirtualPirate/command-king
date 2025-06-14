export interface CommandItem {
  key: string;
  command: string;
  description?: string;
  filePath: string;
}

export interface CommandNode {
  label: string;
  children?: CommandNode[];
  command?: CommandItem;
  isFile?: boolean;
  filePath?: string;
}
