export type ExtractionMode = "regex" | "ai";

export interface ExtractionRequest {
  text?: string;
  mode: ExtractionMode;
}

export interface ExtractionResult {
  success: boolean;
  data: Record<string, unknown> | null;
  mode: ExtractionMode;
  rawText: string;
  error?: string;
}
