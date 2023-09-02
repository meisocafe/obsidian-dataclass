import { SortClassfields, SortExtraFields } from "src/settings/settings";
import { Fields } from "./frontmatter";
import Dataclass from "src/main";

export function sort_frontmatter_fields(fields: Fields, class_field_keys: string[], plugin: Dataclass): Fields {
    const sorted_fields = new Map(
        [...fields.entries()].sort((a: [string, string], b: [string, string]) => {
            const ak = a[0];
            const bk = b[0];

            if (class_field_keys.includes(ak)) {
                if (class_field_keys.includes(bk)) {
                    if (plugin.settings.sort_classfields == SortClassfields.alphabetically) {
                        return ak.localeCompare(bk);
                    } else if (plugin.settings.sort_classfields == SortClassfields.class_file) {
                        return class_field_keys.indexOf(ak) - class_field_keys.indexOf(bk);
                    }
                } else {
                    return -1; // Priority goes to class items
                }
            } else if (class_field_keys.includes(bk)) {
                return 1; // Priority goes to class items
            } else {
                if (plugin.settings.sort_extrafeilds == SortExtraFields.alphabetically) {
                    return ak.localeCompare(bk);
                } else if (plugin.settings.sort_extrafeilds == SortExtraFields.no_sorting) {
                    return 0;
                }
            }

            console.error("compare: reached end of conditions, should not happen");
            return 0;
        }),
    );
    return sorted_fields;
}
