import { TFile } from "obsidian";
import { ClassFormatter } from "src/file_formatter/class_formatter";
import Dataclass from "src/main";
import { ErrorNotice } from "src/ui/error_notice";
import { FieldSuggesterModal } from "src/ui/field_suggester_modal";
import { InputtModal } from "src/ui/input_modal";
import { ErrorType } from "src/utils/error";
import { BaseController } from "./base_controller";

export abstract class FieldRenameController extends BaseController {
    public static rename_field(file: TFile, plugin: Dataclass) {
        this.check_plugin_ready(plugin);

        const field_suggester_modal = new FieldSuggesterModal(file, plugin);

        field_suggester_modal.on_option_selected = (field_name: string) => {
            const input_modal = new InputtModal(plugin.app);
            input_modal.setPlaceholder("New Name...");

            input_modal.on_text_selected = (new_value) => {
                const class_formatter = new ClassFormatter(file, plugin);
                class_formatter.rename_field(field_name, new_value)?.catch((error) => {
                    switch (error.type) {
                        case ErrorType.rename_file_already_exists:
                        case ErrorType.folder_path_path_does_not_exist:
                        case ErrorType.folder_path_path_is_file:
                            new ErrorNotice(`${error.msg}`);
                            break;
                        case ErrorType.note_formatter_yaml_parse_error:
                            break;
                        default:
                            throw error;
                    }
                });
            };
            input_modal.open();
        };
        field_suggester_modal.open();
    }
}
