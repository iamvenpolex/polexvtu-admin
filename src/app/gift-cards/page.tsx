"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getAllGiftCards, generateGiftCards } from "@/lib/services";
import { fmt, fmtDate } from "@/lib/utils";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { Plus, X } from "lucide-react";

interface GiftCard {
  id: number;
  code: string;
  amount: number;
  description: string;
  is_redeemed: boolean;
  redeemed_by: number | null;
  generated_at: string;
  redeemed_at: string | null;
  expires_at: string;
}

export default function GiftCardsPage() {
  const { toasts, toast } = useToast();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    quantity: "1",
    expires_at: "",
    description: "Gift Card",
  });

  const load = async () => {
    try {
      const res = await getAllGiftCards();
      setCards(res.data);
    } catch {
      toast("Failed to load gift cards", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const handleGenerate = async () => {
    if (!form.amount || !form.expires_at) {
      toast("Fill all required fields", "error");
      return;
    }
    setGenerating(true);
    try {
      await generateGiftCards({
        amount: Number(form.amount),
        quantity: Math.min(5, Number(form.quantity) || 1),
        expires_at: form.expires_at,
        description: form.description || "Gift Card",
      });
      toast(`${form.quantity} gift card(s) generated`);
      setShowModal(false);
      setForm({
        amount: "",
        quantity: "1",
        expires_at: "",
        description: "Gift Card",
      });
      load();
    } catch {
      toast("Failed to generate gift cards", "error");
    } finally {
      setGenerating(false);
    }
  };

  const redeemed = cards.filter((c) => c.is_redeemed).length;

  return (
    <AdminShell title="Gift Cards">
      <ToastContainer toasts={toasts} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="stat-card">
          <div className="stat-label">Total Cards</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>
            {cards.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>
            {cards.length - redeemed}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Redeemed</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>
            {redeemed}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="section-title">All Gift Cards</div>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={14} /> Generate Cards
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <span className="spin" />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Generated</th>
                  <th>Redeemed At</th>
                </tr>
              </thead>
              <tbody>
                {cards.length ? (
                  cards.map((c) => (
                    <tr key={c.id}>
                      <td
                        className="mono"
                        style={{ letterSpacing: 1, fontWeight: 500 }}
                      >
                        {c.code}
                      </td>
                      <td style={{ fontWeight: 500, color: "var(--accent)" }}>
                        {fmt(c.amount)}
                      </td>
                      <td style={{ color: "var(--text2)" }}>{c.description}</td>
                      <td>
                        <span
                          className={`badge ${c.is_redeemed ? "badge-danger" : "badge-success"}`}
                        >
                          {c.is_redeemed ? "Redeemed" : "Available"}
                        </span>
                      </td>
                      <td style={{ color: "var(--text3)", fontSize: 12 }}>
                        {fmtDate(c.expires_at)}
                      </td>
                      <td style={{ color: "var(--text3)", fontSize: 12 }}>
                        {fmtDate(c.generated_at)}
                      </td>
                      <td style={{ color: "var(--text3)", fontSize: 12 }}>
                        {c.redeemed_at ? fmtDate(c.redeemed_at) : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No gift cards yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="modal">
            <div className="modal-title">
              Generate Gift Cards
              <button
                onClick={() => setShowModal(false)}
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label className="form-label">Amount (₦) *</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="form-label">Quantity (max 5)</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="5"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="form-label">Expires At *</label>
              <input
                className="form-input"
                type="date"
                value={form.expires_at}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expires_at: e.target.value }))
                }
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="form-label">Description</label>
              <input
                className="form-input"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button className="btn-sm" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="spin" style={{ marginRight: 6 }} />
                    Generating…
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
