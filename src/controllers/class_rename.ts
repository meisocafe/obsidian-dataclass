import { TFile } from "obsidian";
import { ClassFormatter } from "src/file_formatter/class_formatter";
import Dataclass from "src/main";
import { ErrorNotice } from "src/ui/error_notice";
import { InputtModal } from "src/ui/input_modal";
import { ErrorType } from "src/utils/error";
import { BaseController } from "./base_controller";

export abstract class ClassRenameController extends BaseController {
    public static rename_class(class_file: TFile, plugin: Dataclass) {
        this.check_plugin_ready(plugin);

        const input_modal = new InputtModal(plugin.app);
        input_modal.setPlaceholder("New Name...");

        input_modal.on_text_selected = (new_name) => {
            const class_formatter = new ClassFormatter(class_file, plugin);
            class_formatter.rename(new_name).catch((error) => {
                switch (error.type) {
                    case ErrorType.rename_file_already_exists:
                        new ErrorNotice(`Class with name ${new_name} already exists`);
                        break;
                    case ErrorType.note_formatter_yaml_parse_error:
                        break;
                    default:
                        throw error;
                }
            });
        };
        input_modal.open();
    }

    public static rename_class_files(class_file: TFile, old_name: string, plugin: Dataclass) {
        this.check_plugin_ready(plugin);

        const class_formatter = new ClassFormatter(class_file, plugin);
        class_formatter.apply_class_rename(old_name);
    }
}
