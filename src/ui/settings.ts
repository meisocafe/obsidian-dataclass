import { PluginSettingTab, Setting, ToggleComponent, App, normalizePath } from "obsidian";
import Dataclass from "src/main";
import { SortClassfields, SortExtraFields, RenameConflictResolution } from "src/settings/settings";
import { FolderSuggest } from "src/settings/suggesters/FolderSuggester";

export class DataclassSettingTab extends PluginSettingTab {
    constructor(
        app: App,
        private plugin: Dataclass,
    ) {
        super(app, plugin);
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Apply class on save")
            .setDesc("Apply the class to the current file automatically each time you save it.")
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue(this.plugin.settings.format_on_save);
                toggle.onChange(async (value) => {
                    this.plugin.settings.format_on_save = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Dataclass definition files location")
            .setDesc("Files in this folder will define the the class definitions/schema of your frontmatter")
            .addSearch((cb) => {
                new FolderSuggest(cb.inputEl, this.plugin);
                cb.setPlaceholder("Example: __config/dataclass/z")
                    .setValue(this.plugin.settings.classfiles_folder)
                    .onChange((new_path) => {
                        this.plugin.settings.classfiles_folder = normalizePath(new_path);
                        this.plugin.saveSettings();
                    });
                // @ts-ignore
                cb.containerEl.addClass("templater_search");
            });

        new Setting(containerEl)
            .setName("Classs property name")
            .setDesc("Property in frontmatter to determine the class of the note")
            .addText((text) =>
                text
                    .setPlaceholder(this.plugin.settings.class_field)
                    .setValue(this.plugin.settings.class_field)
                    .onChange(async (value) => {
                        this.plugin.settings.class_field = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Folder property name")
            .setDesc(
                "Property in frontmatter to determine the where the note should be moved. Leave it blank to disable this feature.",
            )
            .addText((text) =>
                text
                    .setPlaceholder(this.plugin.settings.folder_field)
                    .setValue(this.plugin.settings.folder_field)
                    .onChange(async (value) => {
                        this.plugin.settings.folder_field = value;
                        await this.plugin.saveSettings();
                    }),
            );

        containerEl.createEl("br", {});

        containerEl.createEl("h2", { text: "Field Sorting" });

        new Setting(containerEl)
            .setName("Sort properties")
            .setDesc("Whether to sort frontmatter properties or not")
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue(this.plugin.settings.sort_fields);
                toggle.onChange(async (value) => {
                    this.plugin.settings.sort_fields = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Class properties sort order")
            .setDesc("How to sort class properties. This has no effect unless sorting is enabled.")
            .addDropdown((text) =>
                text
                    .addOptions({
                        [SortClassfields.class_file]: "Class definition",
                        [SortClassfields.alphabetically]: "Alphabetically",
                    })
                    .setValue(this.plugin.settings.sort_classfields)
                    .onChange(async (value) => {
                        this.plugin.settings.sort_classfields = value as SortClassfields;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Extra properties sort order")
            .setDesc(
                "How to sort extra properties not present in the dataclass file. They will always come after class properties. This has no effect unless sorting is enabled.",
            )
            .addDropdown((text) =>
                text
                    .addOptions({
                        [SortExtraFields.no_sorting]: "No sorting",
                        [SortExtraFields.alphabetically]: "Alphabetically",
                    })
                    .setValue(this.plugin.settings.sort_extrafeilds)
                    .onChange(async (value) => {
                        this.plugin.settings.sort_extrafeilds = value as SortExtraFields;
                        await this.plugin.saveSettings();
                    }),
            );

        containerEl.createEl("br", {});

        containerEl.createEl("h2", { text: "Renaming" });

        if (this.plugin.settings.sort_fields) {
            new Setting(containerEl)
                .setName("Property rename conflict resolution")
                .setDesc(
                    "Choose what action to take when a property is renamed, but a file already has a property with the new chosen name.",
                )
                .addDropdown((text) =>
                    text
                        .addOptions({
                            [RenameConflictResolution.do_nothing]: "Do nothing",
                            [RenameConflictResolution.rename_existing_field]: "Rename existing field",
                        })
                        .setValue(this.plugin.settings.rename_conflict_resolution)
                        .onChange(async (value) => {
                            this.plugin.settings.rename_conflict_resolution = value as RenameConflictResolution;
                            await this.plugin.saveSettings();
                        }),
                );
        }

        new Setting(containerEl)
            .setName("Automatically update notes when renaming class file")
            .setDesc(
                "If enabled, when a normal rename is performed on a class file, all notes of that class will have \
				their class properties updated. This does not affect the rename class command, only normal file rename.",
            )
            .addToggle((toggle: ToggleComponent) => {
                toggle.setValue(this.plugin.settings.rename_notes_on_class_rename);
                toggle.onChange(async (value) => {
                    this.plugin.settings.rename_notes_on_class_rename = value;
                    await this.plugin.saveSettings();
                });
            });

        containerEl.createEl("br", {});

        containerEl.createEl("h2", { text: "Note contents" });

        if (this.plugin.settings.sort_fields) {
            new Setting(containerEl)
                .setName("Insert class contents into file")
                .setDesc(
                    "Choose whether to insert the class definition contents (besides properties/frontmatter) into \
                    the current when the file's  contents are empty",
                )
                .addToggle((toggle: ToggleComponent) => {
                    toggle.setValue(this.plugin.settings.insert_file_contents);
                    toggle.onChange(async (value) => {
                        this.plugin.settings.insert_file_contents = value;
                        await this.plugin.saveSettings();
                    });
                });
        }

        containerEl.createEl("br", {});
    }
}
