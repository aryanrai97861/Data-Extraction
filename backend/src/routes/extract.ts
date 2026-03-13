import { Router, Request, Response } from "express";
import multer from "multer";
import { parseFileByMimetype } from "../services/fileParser.js";
import { extractWithRegex } from "../services/regexExtractor.js";
import { extractWithAI } from "../services/aiExtractor.js";
import type { ExtractionMode, ExtractionResult } from "../types/index.js";

const router = Router();

// Configure multer for in-memory file storage (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  "/extract",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const mode = (req.body.mode as ExtractionMode) || "regex";
      let rawText = (req.body.text as string) || "";

      // If a file was uploaded, parse it to extract text
      if (req.file) {
        const parsed = await parseFileByMimetype(
          req.file.buffer,
          req.file.mimetype,
          req.file.originalname
        );
        rawText = typeof parsed === "string" ? parsed : await parsed;
      }

      if (!rawText || rawText.trim().length === 0) {
        res.status(400).json({
          success: false,
          data: null,
          mode,
          rawText: "",
          error:
            "No text provided. Please upload a file or paste text to extract from.",
        } satisfies ExtractionResult);
        return;
      }

      let data: Record<string, unknown>;

      if (mode === "ai") {
        data = await extractWithAI(rawText);
      } else {
        data = extractWithRegex(rawText);
      }

      const result: ExtractionResult = {
        success: true,
        data,
        mode,
        rawText,
      };

      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";

      console.error("Extraction error:", message);

      res.status(500).json({
        success: false,
        data: null,
        mode: req.body.mode || "regex",
        rawText: req.body.text || "",
        error: message,
      } satisfies ExtractionResult);
    }
  }
);

export default router;
