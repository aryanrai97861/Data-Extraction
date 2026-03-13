import React from "react";

type Mode = "regex" | "ai";

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className="mode-section">
      <h3 className="section-title">
        <span className="icon">⚙️</span> Extraction Method
      </h3>
      <div className="mode-toggle">
        <button
          id="mode-regex"
          className={`mode-btn ${mode === "regex" ? "active" : ""}`}
          onClick={() => onModeChange("regex")}
        >
          <span className="mode-icon">🔍</span>
          <div className="mode-info">
            <span className="mode-label">Regex</span>
            <span className="mode-desc">Pattern matching · Fast · No API key needed</span>
          </div>
        </button>
        <button
          id="mode-ai"
          className={`mode-btn ${mode === "ai" ? "active" : ""}`}
          onClick={() => onModeChange("ai")}
        >
          <span className="mode-icon">🤖</span>
          <div className="mode-info">
            <span className="mode-label">AI (Gemini)</span>
            <span className="mode-desc">Context-aware · Smart · Requires API key</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
