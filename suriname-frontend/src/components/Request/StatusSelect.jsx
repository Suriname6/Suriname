import React from "react";
import StatusBadge from "./StatusBadge";
import { BASE_LABEL, getStatusMeta } from "./statusMeta";

export default function StatusSelect({ role, value, onChange, className = "" }) {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef(null);

  const options = React.useMemo(() => {
    return Object.keys(BASE_LABEL)
      .map(k => ({ key: k, label: BASE_LABEL[k], priority: getStatusMeta(role, k).priority }))
      .sort((a, b) => b.priority - a.priority);
  }, [role]);

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!btnRef.current) return;
      if (!btnRef.current.parentElement.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const current = value ? { key: value, label: BASE_LABEL[value] } : null;

  return (
    <div className={className} style={{ position: "relative" }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {current ? <StatusBadge role={role} status={current.key} /> : <span style={{ color: "#9ca3af" }}>전체</span>}
        </div>
        <span style={{ color: "#6b7280" }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute", zIndex: 40, top: "calc(100% + 6px)", left: 0, right: 0,
            background: "white", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}
          role="listbox"
        >
          <div
            onClick={() => { onChange(""); setOpen(false); }}
            role="option"
            aria-selected={!value}
            style={{ padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            onMouseDown={e => e.preventDefault()}
          >
            <span style={{ color: "#9ca3af" }}>전체</span>
          </div>

          {options.map(opt => (
            <div
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              role="option"
              aria-selected={value === opt.key}
              style={{
                padding: "8px 12px", cursor: "pointer", display: "flex",
                alignItems: "center", gap: 8, background: value === opt.key ? "#f9fafb" : "white"
              }}
              onMouseDown={e => e.preventDefault()}
            >
              <StatusBadge role={role} status={opt.key} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
