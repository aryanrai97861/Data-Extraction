import React from "react";

interface TextInputProps {
  text: string;
  onChange: (text: string) => void;
  onClear: () => void;
}

const TextInput: React.FC<TextInputProps> = ({ text, onChange, onClear }) => {
  return (
    <div className="text-section">
      <h3 className="section-title">
        <span className="icon">📋</span> Paste Text
      </h3>
      <div className="textarea-wrapper">
        <textarea
          id="text-input"
          className="text-area"
          placeholder={`Paste your text here...\n\nExample:\nName: Rahul Sharma\nEmail: rahul@example.com\nSkills: React, Node.js, Python\nExperience: 2 years`}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
        />
        <div className="textarea-footer">
          <span className="char-count">
            {text.length.toLocaleString()} characters
          </span>
          {text.length > 0 && (
            <button
              className="clear-btn small"
              onClick={onClear}
              id="clear-text-btn"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextInput;
