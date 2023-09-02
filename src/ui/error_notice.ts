import { Notice } from "obsidian";

export class ErrorNotice extends Notice {
    constructor(message: string) {
        super(`Dataclass error: ${message}`);
    }
}
