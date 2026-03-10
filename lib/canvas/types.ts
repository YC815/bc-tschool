export interface GeneratorInput {
  photos: [string | null, string | null, string | null, string | null]; // S1-S4 dataURLs
  nickname: string;
  quote: string; // state.submissions["4"].message
}

export type TemplateGenerator = (input: GeneratorInput) => Promise<string>; // → dataURL

export interface MemorialTemplate {
  id: string;
  label: string;
  sublabel: string;
  width: number;
  height: number;
  generate: TemplateGenerator;
}
