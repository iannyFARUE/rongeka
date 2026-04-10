/** Item types that have a text content field */
export const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"])

/** Item types that have a language field and use the code editor */
export const LANGUAGE_TYPES = new Set(["snippet", "command"])

/** Item types that use the markdown editor */
export const MARKDOWN_TYPES = new Set(["note", "prompt"])

/** Item types that require a file upload */
export const FILE_TYPES = new Set(["file", "image"])
