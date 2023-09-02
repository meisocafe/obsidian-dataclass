import { App, Modal } from "obsidian";

export class BasicModal extends Modal {
    constructor(
        public title: string,
        public message: string,
        app: App,
    ) {
        super(app);
    }

    onOpen() {
        const { contentEl, titleEl } = this;
        contentEl.setText(this.message);
        titleEl.setText(this.title);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
