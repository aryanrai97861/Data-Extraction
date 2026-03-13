import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text.trim();
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export function parseTXT(buffer: Buffer): string {
  return buffer.toString("utf-8").trim();
}

export function parseFileByMimetype(
  buffer: Buffer,
  mimetype: string,
  originalname: string
): Promise<string> | string {
  const ext = originalname.split(".").pop()?.toLowerCase();

  if (mimetype === "application/pdf" || ext === "pdf") {
    return parsePDF(buffer);
  }

  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    return parseDOCX(buffer);
  }

  if (
    mimetype === "application/msword" ||
    ext === "doc"
  ) {
    // .doc files are not fully supported; attempt raw text extraction
    return parseTXT(buffer);
  }

  if (mimetype === "text/plain" || ext === "txt") {
    return parseTXT(buffer);
  }

  throw new Error(
    `Unsupported file type: ${mimetype} (${originalname}). Supported: PDF, DOCX, TXT`
  );
}
