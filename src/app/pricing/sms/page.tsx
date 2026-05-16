"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getSMSPrice, setSMSPrice } from "@/lib/services";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { fmt } from "@/lib/utils";
import { Save } from "lucide-react";

export default function SMSPricingPage() {
  const { toasts, toast } = useToast();
  const [current, setCurrent] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSMSPrice()
      .then((res) => {
        setCurrent(res.data.price);
        setNewPrice(String(res.data.price));
      })
      .catch(() => toast("Failed to load SMS price", "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handleSave = async () => {
    const p = Number(newPrice);
    if (!p || p <= 0) {
      toast("Enter a valid price", "error");
      return;
    }
    setSaving(true);
    try {
      await setSMSPrice(p);
      setCurrent(p);
      toast("SMS price updated successfully");
    } catch {
      toast("Failed to update SMS price", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="SMS Pricing">
      <ToastContainer toasts={toasts} />

      <div style={{ maxWidth: 480 }}>
        <div className="rule-box" style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: ".8px",
              marginBottom: 16,
            }}
          >
            Current SMS Price Per Unit
          </div>
          {loading ? (
            <span className="spin" />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text3)",
                    marginBottom: 4,
                  }}
                >
                  Current Price
                </div>
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {current != null ? fmt(current) : "—"}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}
                >
                  per SMS unit
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
          }}
        >
          <div className="section-title" style={{ marginBottom: 20 }}>
            Update SMS Price
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">New Price Per SMS (₦)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              step="0.5"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="e.g. 4"
              style={{ maxWidth: 200 }}
            />
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>
              Users sending 100 SMS will be charged{" "}
              {newPrice ? fmt(Number(newPrice) * 100) : "—"}
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {saving ? <span className="spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Update Price"}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
