export enum SortClassfields {
    class_file = "class_file",
    alphabetically = "alphabetically",
}

export enum SortExtraFields {
    no_sorting = "no_sorting",
    alphabetically = "alphabetically",
}

export enum RenameConflictResolution {
    do_nothing = "do_nothing",
    rename_existing_field = "move_conflicting_field",
}

export interface DataclassSettings {
    classfiles_folder: string;
    class_field: string;
    folder_field: string;
    sort_fields: boolean;
    sort_classfields: SortClassfields;
    sort_extrafeilds: SortExtraFields;
    insert_folder_field: boolean;
    rename_conflict_resolution: RenameConflictResolution;
    rename_notes_on_class_rename: boolean;
    format_on_save: boolean;
    insert_file_contents: boolean;
}

export const DEFAULT_SETTINGS: DataclassSettings = {
    classfiles_folder: "",
    class_field: "type",
    folder_field: "folder",
    sort_fields: true,
    sort_classfields: SortClassfields.class_file,
    sort_extrafeilds: SortExtraFields.no_sorting,
    insert_folder_field: false,
    rename_conflict_resolution: RenameConflictResolution.do_nothing,
    rename_notes_on_class_rename: true,
    format_on_save: false,
    insert_file_contents: true,
};
