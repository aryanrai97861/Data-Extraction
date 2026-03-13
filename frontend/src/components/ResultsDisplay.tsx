import React, { useState } from "react";

interface ResultsDisplayProps {
  data: Record<string, unknown> | null;
  mode: string;
  rawText: string;
  error?: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  data,
  mode,
  rawText,
  error,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = JSON.stringify(data, null, 2);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="results-section">
        <h3 className="section-title">
          <span className="icon">❌</span> Error
        </h3>
        <div className="error-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isEmpty = Object.keys(data).length === 0;

  return (
    <div className="results-section">
      <div className="results-header">
        <h3 className="section-title">
          <span className="icon">✅</span> Extracted Data
        </h3>
        <div className="results-actions">
          <span className="mode-badge">
            {mode === "ai" ? "🤖 AI" : "🔍 Regex"}
          </span>
          <button
            className="action-btn"
            onClick={() => setShowRaw(!showRaw)}
            id="toggle-raw-btn"
          >
            {showRaw ? "JSON" : "Raw Text"}
          </button>
          <button
            className="action-btn copy-btn"
            onClick={handleCopy}
            id="copy-json-btn"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="empty-results">
          <p>No structured data could be extracted from the provided text.</p>
          <p className="hint">
            Try using <strong>AI mode</strong> for better results, or ensure your
            text contains labeled fields (e.g., "Name: John Doe").
          </p>
        </div>
      ) : showRaw ? (
        <div className="raw-text-card">
          <pre>{rawText}</pre>
        </div>
      ) : (
        <div className="json-viewer">
          <pre>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      )}

      {!isEmpty && (
        <div className="field-cards">
          {Object.entries(data).map(([key, value]) => (
            <div className="field-card" key={key}>
              <span className="field-key">{key}</span>
              <span className="field-value">
                {Array.isArray(value) ? (
                  <span className="tags">
                    {value.map((v, i) => (
                      <span className="tag" key={i}>
                        {String(v)}
                      </span>
                    ))}
                  </span>
                ) : typeof value === "object" && value !== null ? (
                  JSON.stringify(value, null, 2)
                ) : (
                  String(value)
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
