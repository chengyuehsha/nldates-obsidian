// Mock Obsidian module for testing
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+/g, "/");
}

export class App {}
export class Editor {}
export class TFile {}
export class PluginSettingTab {}
export class Setting {}
export class EditorSuggest {}
