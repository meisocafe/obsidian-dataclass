import { Command, App as ObsidianApp } from "obsidian";

// Make linters happy when accessing undocumented properties
declare global {
    interface Window {
        CodeMirrorAdapter: {
            commands: {
                save: () => void;
            };
        };
    }
    interface App extends ObsidianApp {
        commands: {
            executeCommandById: (command: string) => void;
            commands: Record<string, Command>;
        };
        dom: {
            appContainerEl: HTMLElement;
        };
    }
}
