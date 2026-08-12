"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import api from "@/lib/api";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { fmtDateTime } from "@/lib/utils";
import { Bell, Plus, Trash2, X } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export default function NotificationsPage() {
  const { toasts, toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.notifications || []);
    } catch {
      toast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const handlePost = async () => {
    if (!title.trim() || !message.trim()) {
      toast("Title and message are required", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/notifications", {
        title: title.trim(),
        message: message.trim(),
      });
      toast("Notification posted successfully");
      setTitle("");
      setMessage("");
      setShowForm(false);
      load();
    } catch {
      toast("Failed to post notification", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this notification? Users will no longer see it."))
      return;
    setDeletingId(id);
    try {
      await api.delete(`/api/notifications/${id}`);
      toast("Notification deleted", "error");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast("Failed to delete notification", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell title="Notifications">
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div className="section-title">Dashboard Notifications</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>
            These appear as a popup when users open their dashboard
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={14} /> New Notification
        </button>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <span className="spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 60,
            textAlign: "center",
          }}
        >
          <Bell
            size={32}
            color="var(--text3)"
            style={{ margin: "0 auto 12px" }}
          />
          <div style={{ color: "var(--text3)", fontSize: 14 }}>
            No notifications yet
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={14} /> Post First Notification
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n, i) => (
            <div
              key={n.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "18px 20px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              {/* Index badge */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "var(--text3)",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{n.title}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtDateTime(n.created_at)}
                    </div>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleDelete(n.id)}
                      disabled={deletingId === n.id}
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {deletingId === n.id ? (
                        <span className="spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "var(--text2)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {n.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New notification modal */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-title">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={18} color="var(--accent)" />
                New Notification
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text3)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">
                Title <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                className="form-input"
                placeholder="e.g. Scheduled Maintenance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
              />
              <div
                style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}
              >
                {title.length}/255
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">
                Message <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <textarea
                className="form-input"
                placeholder="Write your notification message here…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                style={{ resize: "vertical", minHeight: 100 }}
              />
            </div>

            {/* Preview */}
            {(title || message) && (
              <div
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text3)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: ".6px",
                  }}
                >
                  Preview
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  {title || "—"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {message || "—"}
                </div>
              </div>
            )}

            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button className="btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handlePost}
                disabled={submitting}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {submitting ? <span className="spin" /> : <Bell size={14} />}
                {submitting ? "Posting…" : "Post Notification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
