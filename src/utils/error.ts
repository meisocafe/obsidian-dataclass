// Credits go to: SilentVoid13's Templater Plugin: https://github.com/SilentVoid13/Templater

export enum ErrorType {
    rename_file_already_exists = "rename:file_already_exists",
    note_formatter_start_operation_ongoing = "note_formatter:start_operation_ongoing",
    note_formatter_class_file_not_found = "note_formatter:class_file_not_found",
    note_formatter_no_class_field = "note_formatter:no_class_field",
    note_formatter_destination_already_exists = "note_formatter:destination_already_exists",
    note_formatter_yaml_parse_error = "note_formatter:yaml_parse_error",
    folder_path_path_does_not_exist = "folder_path:path_does_not_exist",
    folder_path_path_is_file = "folder_path:path_is_file",
    settings_folder_path_not_set = "settings:folder_path_not_set",
}

export class DataclassError extends Error {
    constructor(
        public type: string,
        public msg?: string,
        public context = {},
    ) {
        super(type);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
