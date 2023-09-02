import { TFile } from "obsidian";
import Dataclass from "src/main";
import { NoteFormatter } from "./note_formatter";
import { Frontmatter } from "src/frontmatter/frontmatter";
import { RenameConflictResolution } from "src/settings/settings";
import { DataclassError, ErrorType } from "src/utils/error";

/**
 * Formats a class_file and all the files pertaining to the class.
 */
export class ClassFormatter {
    private _class_name: string;
    constructor(
        private class_file: TFile,
        private plugin: Dataclass,
    ) {}

    get class_name() {
        return this.class_file.basename;
    }

    /**
     * Rename a class.
     * Renames class_file and the class properties of each note pertaining to the class
     */
    async rename(new_name: string) {
        const old_class_name = this.class_file.basename;
        const new_path = this.class_file.parent?.path + "/" + new_name + "." + this.class_file.extension;

        try {
            await this.plugin.app.fileManager.renameFile(this.class_file, new_path);
            return this.apply_class_rename(old_class_name);
        } catch (error) {
            if (error.message === "Destination file already exists!") {
                throw new DataclassError(
                    ErrorType.rename_file_already_exists,
                    `Destination "${new_path}" already exists.`,
                    { file: this.class_file },
                );
            }
        }
    }

    /**
     * Applies a class rename to all notes pertaining to the class. Use this after the class file has been renamed.
     */
    apply_class_rename(old_name: string) {
        const vault_files = this.plugin.app.vault.getMarkdownFiles();
        for (const file of vault_files) {
            const note_formatter = new NoteFormatter(file, this.plugin);
            note_formatter.start((frontmatter: Frontmatter) => {
                if (frontmatter["type"] === old_name) {
                    note_formatter.change_class(this.class_file.basename);
                }
            });
        }
    }

    rename_field(field_name: string, new_name: string) {
        // Format class, on error abort operation (rename_field will throw an exception)
        const class_file_formatter = new NoteFormatter(this.class_file, this.plugin);

        return class_file_formatter.rename_field(field_name, new_name)?.then(() => {
            // Format notes, apply proper policy
            const vault_files = this.plugin.app.vault.getMarkdownFiles();
            const rename_on_collision =
                this.plugin.settings.rename_conflict_resolution == RenameConflictResolution.rename_existing_field;
            for (const file of vault_files) {
                const note_formatter = new NoteFormatter(file, this.plugin);
                note_formatter.start((frontmatter: Frontmatter) => {
                    if (frontmatter["type"] === this.class_name) {
                        try {
                            const is_folder_field = field_name === this.plugin.settings.folder_field;
                            const insert_folder_field = this.plugin.settings.insert_folder_field;
                            if (!is_folder_field || insert_folder_field) {
                                note_formatter.rename_field(field_name, new_name, rename_on_collision);
                            }
                        } catch (error) {
                            /* empty */
                        }
                    }
                });
            }
        });
    }

    async apply_format() {
        const vault_files = this.plugin.app.vault.getMarkdownFiles();
        for (const file of vault_files) {
            const note_formatter = new NoteFormatter(file, this.plugin);
            note_formatter.start((frontmatter: Frontmatter) => {
                if (frontmatter["type"] === this.class_name) {
                    note_formatter.apply_format();
                    note_formatter.move_file();
                }
            });
        }
    }
}
