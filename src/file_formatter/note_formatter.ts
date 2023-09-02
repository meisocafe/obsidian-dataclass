import matter from "gray-matter";
import { TFile } from "obsidian";
import {
    Fields,
    Frontmatter,
    add_missing_fields,
    clean_all_fields,
    get_frontmatter_fields,
    parse_frontmatter,
    strip_frontmatter,
} from "src/frontmatter/frontmatter";
import { sort_frontmatter_fields } from "src/frontmatter/sort";
import Dataclass from "src/main";
import { SortClassfields } from "src/settings/settings";
import { DataclassError, ErrorType } from "src/utils/error";
import { get_tfiles_from_folder_path } from "src/utils/utils";

export class NoteFormatter {
    private frontmatter: Frontmatter | undefined = undefined;

    constructor(
        private file: TFile,
        private plugin: Dataclass,
    ) {}

    /**
     * Starts processFrontMatter operation. Within this callback, frontmatter is available as a parameter, and all operations
     * will be applied atomically. Start calls cannot be nested.
     */
    start(apply: (frontmatter: Frontmatter) => void) {
        if (this.frontmatter !== undefined) {
            throw new DataclassError(ErrorType.note_formatter_start_operation_ongoing);
        }
        return this.plugin.app.fileManager
            .processFrontMatter(this.file, (frontmatter: Frontmatter) => {
                this.frontmatter = frontmatter;
                apply(frontmatter);
                this.frontmatter = undefined;
            })
            .catch((error) => {
                if (error.name == "YAMLParseError") {
                    throw new DataclassError(
                        ErrorType.note_formatter_yaml_parse_error,
                        `Could not parse YAML:\n\n${error.message}`,
                        { file: this.file },
                    );
                }
            });
    }

    /**
     * Renames file's field
     */
    rename_field(field_name: string, new_name: string, rename_on_collision = false) {
        return this.process((frontmatter: Frontmatter) => {
            if (frontmatter[new_name] !== undefined) {
                if (rename_on_collision) {
                    let collision_new_name = new_name + "_1";
                    let count = 1;
                    while (frontmatter[collision_new_name] !== undefined) {
                        count += 1;
                        collision_new_name = collision_new_name.slice(0, -1) + count;
                    }
                    frontmatter[collision_new_name] = frontmatter[new_name];
                } else {
                    throw new DataclassError(ErrorType.rename_file_already_exists, `Field ${new_name} already exists`, {
                        file: this.file,
                    });
                }
            }

            // In order to add the field to the same place as the previous, we must remove all the object's
            // properties and insert them again in the desired order.
            const fields = clean_all_fields(frontmatter);
            const fields_list = [...fields.entries()];
            for (const [i, value] of fields_list.entries()) {
                if (value[0] === field_name) {
                    fields_list[i][0] = new_name;
                }
            }
            add_missing_fields(new Map(fields_list), frontmatter);
        });
    }

    /**
     * Applies the corresponding format according to the class of the file.
     *
     * Do not use with class_files.
     */
    async apply_format() {
        const class_fields = await this.get_class_file_fields();
        this.process((frontmatter: Frontmatter) => {
            const file_class = this.get_file_class(frontmatter);

            if (!this.plugin.settings.insert_folder_field) {
                class_fields.delete(this.plugin.settings.folder_field);
            }

            add_missing_fields(class_fields, frontmatter);

            if (this.plugin.settings.sort_fields) {
                // In order to sort, we empty the frontmatter and get the fields as a map
                const frontmatter_fields = clean_all_fields(frontmatter);

                // Prepare sorted array of keys if needed
                let class_field_keys = [""];
                if (this.plugin.settings.sort_classfields == SortClassfields.class_file) {
                    class_field_keys = Array.from(class_fields.keys());
                }
                // Sort the map
                const sorted_fields = sort_frontmatter_fields(frontmatter_fields, class_field_keys, this.plugin);

                // Add back the fields to the ferontmatter object
                frontmatter[this.plugin.settings.class_field] = file_class;
                add_missing_fields(sorted_fields, frontmatter);
            }
        });
    }

    async move_file() {
        const class_fields = await this.get_class_file_fields();
        const target_path = class_fields.get(this.plugin.settings.folder_field);
        if (target_path && this.file.parent?.path != target_path) {
            return this.plugin.app.fileManager
                .renameFile(this.file, target_path + "/" + this.file.name)
                .catch((error) => {
                    if (error.message === "Destination file already exists!") {
                        throw new DataclassError(
                            ErrorType.note_formatter_destination_already_exists,
                            `Destination "${target_path + "/" + this.file.name}" already exists.`,
                            { file: this.file },
                        );
                    }
                });
        }
    }

    /**
     * Change note's class
     */
    change_class(new_class_name: string) {
        this.process((frontmatter: Frontmatter) => {
            frontmatter[this.plugin.settings.class_field] = new_class_name;
        });
    }

    async add_class_markdown() {
        const class_content = await this.get_class_file_contents();
        this.plugin.app.vault.process(this.file, (contents: string) => {
            const parsed_contents = parse_frontmatter(contents);
            if (this.plugin.settings.insert_file_contents && !/\S/.test(parsed_contents.content)) {
                return matter.stringify(class_content, parsed_contents.data, {
                    language: parsed_contents.language,
                });
            } else {
                return contents;
            }
        });
    }

    get_file_class(frontmatter: Frontmatter): string {
        return frontmatter[this.plugin.settings.class_field];
    }

    /**
     * Internal wrapper for fileManager.processFrontMatter to avoid nesting calls to it. With this we can use this class's methods
     * both inside the start callback or by themselves.
     */
    private process(apply: (frontmatter: Frontmatter) => void) {
        if (this.frontmatter === undefined) {
            return this.start(apply);
        } else {
            apply(this.frontmatter);
        }
    }

    /**
     * Get fields for class file corresponding to current Note.
     */
    private async get_class_file(): Promise<TFile> {
        // Line below clashes with "position" property, should be fixed on obsidian 1.4
        //const frontmatter = this.plugin.app.metadataCache.getFileCache(this.file)?.frontmatter as Frontmatter;

        const fields = await get_frontmatter_fields(this.file, this.plugin);
        const file_class = fields.get(this.plugin.settings.class_field);
        if (file_class == undefined) {
            throw new DataclassError(ErrorType.note_formatter_no_class_field);
        }
        const class_files = get_tfiles_from_folder_path(this.plugin.settings.classfiles_folder);
        // Check if file corresponds to dataclass
        const class_file = class_files.find((value: TFile, index: number, obj: TFile[]) => {
            return value.basename === file_class;
        });
        if (class_file === undefined) {
            throw new DataclassError(ErrorType.note_formatter_class_file_not_found, `No class named ${file_class}`, {
                file: this.file,
            });
        }
        return class_file;
    }

    private async get_class_file_fields(): Promise<Fields> {
        const class_file = await this.get_class_file();
        return await get_frontmatter_fields(class_file, this.plugin);
    }

    private async get_class_file_contents(): Promise<string> {
        const class_file = await this.get_class_file();
        const raw_contents = await this.plugin.app.vault.read(class_file);
        return strip_frontmatter(raw_contents);
    }
}
