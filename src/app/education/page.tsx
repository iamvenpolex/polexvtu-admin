"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getEducationPrices, setEducationPrice } from "@/lib/services";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { fmt } from "@/lib/utils";
import { Save } from "lucide-react";

const PROVIDERS = [
  { key: "waec", label: "WAEC", desc: "West African Examinations Council" },
  { key: "neco", label: "NECO", desc: "National Examinations Council" },
  {
    key: "nabteb",
    label: "NABTEB",
    desc: "National Business & Technical Examinations Board",
  },
  {
    key: "nbais",
    label: "NBAIS",
    desc: "National Board for Arabic and Islamic Studies",
  },
];

export default function EducationPage() {
  const { toasts, toast } = useToast();
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    getEducationPrices()
      .then((res) => {
        const data: { provider: string; final_price: number }[] =
          res.data.data || [];
        const p: Record<string, number | null> = {};
        const inp: Record<string, string> = {};
        PROVIDERS.forEach((pr) => {
          const found = data.find((d) => d.provider === pr.key);
          p[pr.key] = found?.final_price ?? null;
          inp[pr.key] = found ? String(found.final_price) : "";
        });
        setPrices(p);
        setInputs(inp);
      })
      .catch(() => toast("Failed to load education prices", "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handleSave = async (provider: string) => {
    const val = Number(inputs[provider]);
    if (!val || val <= 0) {
      toast("Enter a valid price", "error");
      return;
    }
    setSaving(provider);
    try {
      await setEducationPrice(provider, val);
      setPrices((prev) => ({ ...prev, [provider]: val }));
      toast(`${provider.toUpperCase()} price updated`);
    } catch {
      toast(`Failed to update ${provider.toUpperCase()} price`, "error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminShell title="Education Prices">
      <ToastContainer toasts={toasts} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 16,
        }}
      >
        {PROVIDERS.map((p) => (
          <div
            key={p.key}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}
                >
                  {p.desc}
                </div>
              </div>
              <span
                className={`badge ${prices[p.key] ? "badge-success" : "badge-gray"}`}
              >
                {prices[p.key] ? "Set" : "Not set"}
              </span>
            </div>

            {loading ? (
              <span className="spin" />
            ) : (
              <>
                <div style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text3)",
                      marginBottom: 2,
                    }}
                  >
                    Current Price
                  </div>
                  <div
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--accent)",
                    }}
                  >
                    {prices[p.key] != null ? fmt(prices[p.key]!) : "Not set"}
                  </div>
                </div>

                <label className="form-label" style={{ marginTop: 16 }}>
                  New Price (₦)
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={inputs[p.key] || ""}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        [p.key]: e.target.value,
                      }))
                    }
                    placeholder="e.g. 2500"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => handleSave(p.key)}
                    disabled={saving === p.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {saving === p.key ? (
                      <span className="spin" />
                    ) : (
                      <Save size={13} />
                    )}
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
