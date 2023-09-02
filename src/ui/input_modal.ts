import { App, SuggestModal } from "obsidian";

/**
 * Modal with same appearance as SuggestModal that only takes text input without suggestion.
 *
 * This is a bit of a hacky implementation stripping SuggestModal of it's suggestion features instead
 * of a proper implementation extending Modal.
 */
export class InputtModal extends SuggestModal<string> {
    //public inputEl: HTMLInputElement;
    public title: string | undefined = undefined;
    //public placeholder_text = "";
    public on_text_selected: (value: string) => void = () => {};

    constructor(app: App) {
        super(app);
        this.containerEl.querySelector(".prompt-results")?.remove(); // Remove the suggest box
    }

    onOpen() {
        const { titleEl } = this;
        if (this.title !== undefined) {
            titleEl.setText(this.title);
        }
    }

    getSuggestions(query: string): string[] | Promise<string[]> {
        return [query]; // Only choice is our own input
    }

    renderSuggestion(value: string, el: HTMLElement) {}

    onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
        return this.on_text_selected(item);
    }
}
