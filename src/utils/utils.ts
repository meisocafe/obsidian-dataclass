import { FileView, TAbstractFile, TFile, TFolder, Vault, normalizePath } from "obsidian";
import { DataclassError, ErrorType } from "./error";
import Dataclass from "src/main";
import { DataclassSettings } from "src/settings/settings";

// Credits go to SilentVoid13's Templater Plugin: https://github.com/SilentVoid13/Templater
export function tfolder_from_path(folder_path: string): TFolder {
    folder_path = normalizePath(folder_path);

    const folder = this.app.vault.getAbstractFileByPath(folder_path);
    if (!folder) {
        throw new DataclassError(ErrorType.folder_path_path_does_not_exist, `Folder "${folder_path}" doesn't exist`);
    }
    if (!(folder instanceof TFolder)) {
        throw new DataclassError(ErrorType.folder_path_path_is_file, `${folder_path} is a file, not a folder`);
    }

    return folder;
}

// Credits go to SilentVoid13's Templater Plugin: https://github.com/SilentVoid13/Templater
export function get_tfiles_from_folder_path(folder_path: string): Array<TFile> {
    if (!folder_path) return [];

    const folder = tfolder_from_path(folder_path);

    const files: Array<TFile> = [];
    Vault.recurseChildren(folder, (file: TAbstractFile) => {
        if (file instanceof TFile) {
            files.push(file);
        }
    });

    files.sort((a, b) => {
        return a.basename.localeCompare(b.basename);
    });

    return files;
}

export function is_class_file(file: TFile, settings: DataclassSettings): boolean {
    return file.parent?.path === settings.classfiles_folder;
}

export function get_current_active_file(plugin: Dataclass): TFile | undefined {
    const file_view = plugin.app.workspace.getActiveViewOfType(FileView);
    const current_file = plugin.app.workspace.getActiveFile();
    if (file_view && current_file) {
        return current_file;
    }
}

export function get_current_active_class_file(plugin: Dataclass): TFile | undefined {
    const current_file = get_current_active_file(plugin);
    if (current_file && is_class_file(current_file, plugin.settings)) {
        return current_file;
    }
    return undefined;
}
