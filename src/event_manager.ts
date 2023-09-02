import { EventRef, TAbstractFile, TFile } from "obsidian";
import Dataclass from "./main";
import { FormatNoteController } from "./controllers/format_note";
import { is_class_file } from "./utils/utils";
import { ClassRenameController } from "./controllers/class_rename";
import * as path from "path";

export class EventManager {
    constructor(private plugin: Dataclass) {}

    register_onload() {
        this.registerEvent(
            // https://docs.obsidian.md/Reference/TypeScript+API/Vault/on_1
            // this.app.metadataCache.on("changed", (file: TFile, data: string, cache: CachedMetadata) => {
            this.plugin.app.vault.on("modify", (file: TFile) => {
                const file_saved = this.plugin.file_manually_saved_cache.delete(file.path);
                if (file_saved && !is_class_file(file, this.plugin.settings)) {
                    FormatNoteController.format_note(file, this.plugin);
                }
            }),
        );

        this.registerEvent(
            this.plugin.app.vault.on("rename", (file: TAbstractFile, oldPath: string) => {
                if (
                    file instanceof TFile &&
                    is_class_file(file, this.plugin.settings) &&
                    this.plugin.settings.rename_notes_on_class_rename
                ) {
                    const old_name = path.parse(oldPath).name;
                    ClassRenameController.rename_class_files(file, old_name, this.plugin);
                }
            }),
        );
    }

    private registerEvent(event: EventRef) {
        return this.plugin.registerEvent(event);
    }
}
