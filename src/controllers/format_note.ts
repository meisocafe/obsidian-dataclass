import { TFile } from "obsidian";
import { ClassFormatter } from "src/file_formatter/class_formatter";
import { NoteFormatter } from "src/file_formatter/note_formatter";
import Dataclass from "src/main";
import { ErrorNotice } from "src/ui/error_notice";
import { ErrorType } from "src/utils/error";
import { BaseController } from "./base_controller";

export abstract class FormatNoteController extends BaseController {
    public static format_note(file: TFile, plugin: Dataclass) {
        this.check_plugin_ready(plugin);

        const file_formatter = new NoteFormatter(file, plugin);
        file_formatter
            .start(() => {
                file_formatter
                    .move_file()
                    .catch((error) => {
                        if (error.type === ErrorType.note_formatter_destination_already_exists) {
                            new ErrorNotice(`${error.msg}`);
                        }
                    })
                    .then(() => {
                        file_formatter.apply_format();
                    })
                    .catch((error) => {
                        switch (error.type) {
                            case ErrorType.note_formatter_class_file_not_found:
                            case ErrorType.folder_path_path_does_not_exist:
                            case ErrorType.folder_path_path_is_file:
                                new ErrorNotice(`${error.msg}`);
                                break;
                            case ErrorType.note_formatter_no_class_field:
                                break;
                            default:
                                throw error;
                        }
                    })
                    .then(() => {
                        file_formatter.add_class_markdown();
                    })
                    .catch((error) => {
                        switch (error.type) {
                            case ErrorType.note_formatter_class_file_not_found:
                                new ErrorNotice(`${error.msg}`);
                                break;
                            case ErrorType.note_formatter_no_class_field:
                                break;
                            default:
                                throw error;
                        }
                    });
            })
            .catch((error) => {
                switch (error.type) {
                    case ErrorType.note_formatter_yaml_parse_error:
                        new ErrorNotice(`${error.msg}`);
                        break;
                    default:
                        throw error;
                }
            });
    }

    public static format_all_class_notes(class_file: TFile, plugin: Dataclass) {
        this.check_plugin_ready(plugin);

        const class_formatter = new ClassFormatter(class_file, plugin);
        class_formatter.apply_format()?.catch((error) => {
            switch (error.type) {
                case ErrorType.note_formatter_class_file_not_found:
                case ErrorType.note_formatter_destination_already_exists:
                    new ErrorNotice(`${error.context["file"].name}: ${error.msg}`);
                    break;
                case ErrorType.folder_path_path_does_not_exist:
                case ErrorType.folder_path_path_is_file:
                    new ErrorNotice(`${error.msg}`);
                    break;
                case ErrorType.note_formatter_no_class_field:
                case ErrorType.note_formatter_yaml_parse_error:
                    break;
                default:
                    throw error;
            }
        });
    }
}
