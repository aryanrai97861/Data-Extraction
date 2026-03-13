import { useState } from "react";
import FileUpload from "./components/FileUpload";
import TextInput from "./components/TextInput";
import ModeSelector from "./components/ModeSelector";
import ResultsDisplay from "./components/ResultsDisplay";
import "./App.css";

type Mode = "regex" | "ai";

interface ExtractionResult {
  success: boolean;
  data: Record<string, unknown> | null;
  mode: string;
  rawText: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("regex");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const canExtract = file !== null || text.trim().length > 0;

  const handleExtract = async () => {
    if (!canExtract) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("mode", mode);

      if (file) {
        formData.append("file", file);
      }
      if (text.trim()) {
        formData.append("text", text);
      }

      const res = await fetch(`${API_URL}/api/extract`, {
        method: "POST",
        body: formData,
      });

      const data: ExtractionResult = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        data: null,
        mode,
        rawText: text,
        error:
          err instanceof Error
            ? err.message
            : "Failed to connect to the server. Make sure the backend is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setText("");
    setResult(null);
  };

  return (
    <div className="app">
      <div className="glow glow-1" />
      <div className="glow glow-2" />

      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>ExtractIQ</h1>
        </div>
        <p className="subtitle">
          Transform unstructured documents into structured JSON — powered by
          Regex & Gemini AI
        </p>
      </header>

      <main className="main">
        <div className="input-grid">
          <FileUpload
            onFileSelect={setFile}
            selectedFile={file}
            onClear={() => setFile(null)}
          />

          <div className="divider-vertical">
            <span className="divider-text">OR</span>
          </div>

          <TextInput text={text} onChange={setText} onClear={() => setText("")} />
        </div>

        <ModeSelector mode={mode} onModeChange={setMode} />

        <div className="action-bar">
          <button
            id="extract-btn"
            className={`extract-btn ${loading ? "loading" : ""}`}
            disabled={!canExtract || loading}
            onClick={handleExtract}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Extract Data</span>
              </>
            )}
          </button>

          {result && (
            <button
              className="reset-btn"
              onClick={handleReset}
              id="reset-btn"
            >
              ↻ Reset
            </button>
          )}
        </div>

        {result && (
          <ResultsDisplay
            data={result.data}
            mode={result.mode}
            rawText={result.rawText}
            error={result.error}
          />
        )}
      </main>

      <footer className="footer">
        <p>
          Built with React + Vite · Node.js · Gemini AI
        </p>
      </footer>
    </div>
  );
}

export default App;
