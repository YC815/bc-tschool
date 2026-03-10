export * from "./types";
export { templatePolaroid } from "./template-polaroid";
export { templateReceipt } from "./template-receipt";
export { templateMap } from "./template-map";
export { templateShield } from "./template-shield";

import { templatePolaroid } from "./template-polaroid";
import { templateReceipt } from "./template-receipt";
import { templateMap } from "./template-map";
import { templateShield } from "./template-shield";
import type { MemorialTemplate } from "./types";

export const TEMPLATES: MemorialTemplate[] = [
  templatePolaroid,
  templateReceipt,
  templateMap,
  templateShield,
];
