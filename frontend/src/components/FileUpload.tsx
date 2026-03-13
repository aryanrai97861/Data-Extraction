import React, { useRef, useState, type DragEvent } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (ext === "docx" || ext === "doc") return "📝";
    return "📃";
  };

  return (
    <div className="upload-section">
      <h3 className="section-title">
        <span className="icon">📁</span> Upload Document
      </h3>
      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload-input"
        />

        {selectedFile ? (
          <div className="file-info">
            <span className="file-icon">{getFileIcon(selectedFile.name)}</span>
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">
                {formatSize(selectedFile.size)}
              </span>
            </div>
            <button
              className="clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                if (inputRef.current) inputRef.current.value = "";
              }}
              title="Remove file"
              id="clear-file-btn"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="drop-prompt">
            <div className="drop-icon">
              {isDragging ? "📥" : "☁️"}
            </div>
            <p className="drop-text">
              {isDragging
                ? "Drop your file here"
                : "Drag & drop or click to upload"}
            </p>
            <p className="drop-hint">
              Supports PDF, DOCX, DOC, TXT (max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
