import matter from "gray-matter";
import { TFile } from "obsidian";
import Dataclass from "src/main";

export interface Frontmatter {
    [Key: string]: string;
}

export type Fields = Map<string, string>;

export function get_frontmatter_fields(file: TFile, plugin: Dataclass): Promise<Fields> {
    // TODO: Look for a cleaner, more efficient way of doing this, calling processFrontMatter does more than we need
    // Using cache can have problems because it's property "position" can collide with metadata
    // UPDATE: The above problem seems to be sovled with 1.4
    return new Promise<Fields>((resolve, reject) => {
        plugin.app.fileManager
            .processFrontMatter(file, (frontmatter) => {
                resolve(frontmatter_to_fields(frontmatter));
            })
            .catch((error) => {
                reject(error);
            });
    });
}

export function frontmatter_to_fields(frontmatter: Frontmatter): Fields {
    return new Map(Object.entries(frontmatter));
}

/**
 * Adds fields not already existing in frontmatter.
 *
 * @param fields object with frontmatter fields to add
 * @param frontmatter object to which to add the fields
 */
export function add_missing_fields(fields: Fields, frontmatter: Frontmatter) {
    for (const [key, value] of fields) {
        if (!frontmatter.hasOwnProperty(key)) {
            frontmatter[key] = value;
        }
    }
}

/**
 * Removes the fields inside 'fields' from the frontmatter, and returns them separated
 *
 * @param fields object with frontmatter fields to extract
 * @param frontmatter object from which to extract the fields
 */
export function extract_fields(fields: Fields, frontmatter: Frontmatter): Fields {
    const removed_fields: Fields = new Map();
    for (const [key] of fields) {
        if (frontmatter.hasOwnProperty(key)) {
            removed_fields.set(key, frontmatter[key]);
            delete frontmatter[key];
        }
    }

    return removed_fields;
}

/**
 * Removes all fields from the provided frontmatter and returns them in a separate object
 *
 * @param frontmatter frontmatter object to clear fields from
 * @returns removed fields in a frontmatter object
 */
export function clean_all_fields(frontmatter: Frontmatter): Fields {
    const fields = frontmatter_to_fields(frontmatter);

    for (const key in frontmatter) {
        if (typeof key == "string") {
            delete frontmatter[key];
        }
    }

    return fields;
}

export function parse_frontmatter(markdown_data: string) {
    const parsed_data = matter(markdown_data);
    return parsed_data;
}

export function strip_frontmatter(markdown_data: string) {
    return matter(markdown_data).content;
}
