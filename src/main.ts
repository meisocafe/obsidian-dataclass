import { App as ObsidianApp, Plugin, PluginManifest } from "obsidian";
import { DEFAULT_SETTINGS, DataclassSettings } from "./settings/settings";
import { EventManager } from "./event_manager";
import { CommandManager } from "./command_manager";
import { DataclassSettingTab } from "./ui/settings";
import { DataclassError, ErrorType } from "./utils/error";

export default class Dataclass extends Plugin {
    public settings: DataclassSettings;
    public event_manager: EventManager;
    public command_manager: CommandManager;
    public file_manually_saved_cache = new Set();
    public app: App;

    constructor(app: ObsidianApp, manifest: PluginManifest) {
        super(app, manifest);
        this.app = app as App; // Enables custom extended typing for App. See 'extensions.ts'
    }

    async onload() {
        await this.loadSettings();

        this.event_manager = new EventManager(this);
        this.command_manager = new CommandManager(this);

        this.event_manager.register_onload();
        this.command_manager.register_onload();

        this.addSettingTab(new DataclassSettingTab(this.app, this));
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    is_ready() {
        const classfiles_folder = this.settings.classfiles_folder;
        if (!(classfiles_folder.length > 0)) {
            throw new DataclassError(ErrorType.settings_folder_path_not_set, "Class folder is not set");
        }
    }
}
