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
        bottom: 20,
        right: 20,
        left: window.innerWidth <= 768 ? 20 : "auto",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-base toast-${t.type}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            maxWidth: 350,
            width: "100%",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              minWidth: 18,
            }}
          >
            {icons[t.type]}
          </span>

          <span
            style={{
              flex: 1,
              wordBreak: "break-word",
            }}
          >
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}
