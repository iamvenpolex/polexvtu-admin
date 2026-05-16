"use client";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const icons = {
  success: "✓",
  error: "✕",
  info: "●",
};

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} className={`toast-base toast-${t.type}`}>
          <span style={{ fontWeight: 600 }}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
