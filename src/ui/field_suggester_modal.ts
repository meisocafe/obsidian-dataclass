import { FuzzySuggestModal, TFile } from "obsidian";
import { Fields, get_frontmatter_fields } from "src/frontmatter/frontmatter";
import Dataclass from "src/main";

export class FieldSuggesterModal extends FuzzySuggestModal<[string, string]> {
    private fields: [string, string][];
    public on_option_selected: (value: string) => void = () => {};

    constructor(class_file: TFile, plugin: Dataclass) {
        super(plugin.app);
        this.setPlaceholder("Choose field...");

        get_frontmatter_fields(class_file, plugin).then((fields: Fields) => {
            this.fields = [...fields.entries()];
            this.inputEl.dispatchEvent(new InputEvent("input")); // Otherwise suggestions are not show until user inputs something
        });
    }

    onOpen() {
        const { titleEl } = this;
        titleEl.setText("Select a field");
        this.emptyStateText = " ";
    }

    getItems(): [string, string][] {
        return this.fields;
    }

    getItemText(item: [string, string]): string {
        return item[0];
    }

    onChooseItem(item: [string, string], evt: MouseEvent | KeyboardEvent): void {
        this.on_option_selected(item[0]);
    }
}
