import Dataclass from "./main";
import { get_current_active_class_file, get_current_active_file, is_class_file } from "./utils/utils";
import { FieldRenameController } from "./controllers/field_rename";
import { FormatNoteController } from "./controllers/format_note";
import { ClassRenameController } from "./controllers/class_rename";

export class CommandManager {
    constructor(private plugin: Dataclass) {}

    register_onload() {
        this.plugin.addCommand({
            id: "rename-class-field",
            name: "Rename a field in the current class definition",
            checkCallback: (checking: boolean) => {
                const current_file = get_current_active_class_file(this.plugin);
                if (current_file !== undefined) {
                    if (!checking) {
                        FieldRenameController.rename_field(current_file, this.plugin);
                    }
                    return true;
                }
            },
        });

        this.plugin.addCommand({
            id: "rename-class",
            name: "Rename current class file",
            checkCallback: (checking: boolean) => {
                const current_file = get_current_active_class_file(this.plugin);
                if (current_file !== undefined) {
                    if (!checking) {
                        ClassRenameController.rename_class(current_file, this.plugin);
                    }
                    return true;
                }
            },
        });

        this.plugin.addCommand({
            id: "update-all-class",
            name: "Update all files related to the current open class file",
            checkCallback: (checking: boolean) => {
                const current_file = get_current_active_class_file(this.plugin);
                if (current_file !== undefined) {
                    if (!checking) {
                        FormatNoteController.format_all_class_notes(current_file, this.plugin);
                    }
                    return true;
                }
            },
        });

        this.plugin.addCommand({
            id: "update-current-note",
            name: "Apply the class to the current file",
            checkCallback: (checking: boolean) => {
                const current_file = get_current_active_file(this.plugin);
                if (current_file !== undefined && !is_class_file(current_file, this.plugin.settings)) {
                    if (!checking) {
                        FormatNoteController.format_note(current_file, this.plugin);
                    }
                    return true;
                }
            },
        });

        // Wrap existing commands
        //
        // Credits go to:
        // - https://github.com/hipstersmoothie/obsidian-plugin-prettier/blob/main/src/main.ts
        // - https://github.com/platers/obsidian-linter/blob/0fbb67f92aad524ae6ad096b04a52620cb161c63/src/main.ts

        // Save
        const saveCommandDefinition = this.plugin.app.commands?.commands?.["editor:save-file"];
        const save_callback = saveCommandDefinition?.callback;
        if (typeof save_callback === "function") {
            saveCommandDefinition.callback = () => {
                if (this.plugin.is_loaded && this.plugin.settings.format_on_save) {
                    // save_callback calls an async function to save. This means we can encounter a race condition
                    // by trying to read the file right after the call. We also cannot implement our own save method
                    // because other plugins may already have hooked into the event. So we rely on the event
                    // 'plugin.app.vault.on("modify")' and use a cache to communicate with it.
                    // Please let me know if there is a cleaner way of achieving this.

                    const file = this.plugin.app.workspace.getActiveFile();
                    if (file) {
                        this.plugin.file_manually_saved_cache.add(file.path);
                    }
                }
                save_callback();
            };
        }

        // Save for vim mode (:w)
        window.CodeMirrorAdapter.commands.save = () => {
            this.plugin.app.commands.executeCommandById("editor:save-file");
        };
    }
}
