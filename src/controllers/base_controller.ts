import Dataclass from "src/main";
import { ErrorNotice } from "src/ui/error_notice";

export class BaseController {
    public static check_plugin_ready(plugin: Dataclass) {
        try {
            plugin.is_ready();
        } catch (error) {
            throw new ErrorNotice(error.msg);
        }
    }
}
