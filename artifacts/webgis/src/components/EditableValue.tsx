import { useState, useRef, useEffect, CSSProperties } from "react";

interface Props {
  value: string | number;
  suffix?: string;
  type?: "text" | "number";
  decimals?: number;
  placeholder?: string;
  onSave: (v: string) => void;
  className?: string;
  style?: CSSProperties;
  multiline?: boolean;
}

export default function EditableValue({ value, suffix = "", type = "text", decimals, placeholder, onSave, className = "", style, multiline = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(String(value)); }, [value]);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed !== "" && trimmed !== String(value)) onSave(trimmed);
    setEditing(false);
  };

  const display = decimals != null && typeof value === "number"
    ? value.toFixed(decimals)
    : String(value);

  if (editing && multiline) {
    return (
      <span className="editable-wrap editing" style={style}>
        <textarea
          ref={textareaRef}
          className="editable-input editable-textarea"
          value={draft}
          placeholder={placeholder}
          rows={4}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === "Escape") { setDraft(String(value)); setEditing(false); }
            if (e.key === "Enter" && e.ctrlKey) commit();
          }}
        />
      </span>
    );
  }

  if (editing) {
    return (
      <span className="editable-wrap editing" style={style}>
        <input
          ref={inputRef}
          className="editable-input"
          type={type}
          step={type === "number" ? "any" : undefined}
          value={draft}
          placeholder={placeholder}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") { setDraft(String(value)); setEditing(false); }
          }}
        />
        {suffix && <span className="editable-suffix">{suffix}</span>}
      </span>
    );
  }

  return (
    <span
      className={`editable-wrap ${className}`}
      onClick={() => setEditing(true)}
      title={multiline ? "Click để chỉnh sửa (Ctrl+Enter để lưu)" : "Click để chỉnh sửa"}
      style={style}
    >
      <span className="editable-display">
        {value === "" || (value === 0 && placeholder)
          ? <em className="editable-empty">{placeholder || "Chưa có"}</em>
          : multiline
            ? <span style={{ whiteSpace: "pre-wrap" }}>{display}</span>
            : display + suffix
        }
      </span>
      <svg className="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </span>
  );
}
