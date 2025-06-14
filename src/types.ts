export interface CommandItem {
  key: string;
  command: string;
  filePath: string;
}

export interface CommandNode {
  label: string;
  children?: CommandNode[];
  command?: CommandItem;
  isFile?: boolean;
  filePath?: string;
}
