export * from "./types";
export { templatePolaroid } from "./template-polaroid";
export { templatePostcard } from "./template-postcard";
export { templateStories } from "./template-stories";

import { templatePolaroid } from "./template-polaroid";
import { templatePostcard } from "./template-postcard";
import { templateStories } from "./template-stories";
import type { MemorialTemplate } from "./types";

export const TEMPLATES: MemorialTemplate[] = [
  templatePostcard,
  templatePolaroid,
  templateStories,
];
