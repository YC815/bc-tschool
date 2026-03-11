export * from "./types";
export { templatePolaroid } from "./template-polaroid";

import { templatePolaroid } from "./template-polaroid";
import type { MemorialTemplate } from "./types";

export const TEMPLATES: MemorialTemplate[] = [
  templatePolaroid,
];
