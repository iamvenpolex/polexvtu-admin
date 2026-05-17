"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getCableTVPlans, setCableTVCustomPrice } from "@/lib/services";
import { SmartPricingTable } from "@/components/ui/SmartPricingTable";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { useSmartPricing, calcFinal, Plan } from "@/hooks/useSmartPricing";
import { Save, RefreshCw } from "lucide-react";

const COMPANIES = [
  { key: "dstv", label: "DSTV" },
  { key: "gotv", label: "GOtv" },
  { key: "startimes", label: "Startimes" },
  { key: "showmax", label: "Showmax" },
];

export default function CableTVPricingPage() {
  const { toasts, toast } = useToast();
  const [company, setCompany] = useState("dstv");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    plans,
    setPlans,
    globalMarkup,
    setGlobalMarkup,
    setFixed,
    setMarkup,
  } = useSmartPricing();

  const load = async (co: string) => {
    setLoading(true);
    try {
      const res = await getCableTVPlans(co);
      // Map API response: customPrice is what's stored in DB
      const mapped: Plan[] = (res.data.plans || []).map(
        (p: {
          plan_id: string;
          name: string;
          price: number;
          customPrice?: number;
        }) => ({
          plan_id: p.plan_id,
          name: p.name,
          ea_price: p.price,
          fixed_price:
            p.customPrice && p.customPrice !== p.price ? p.customPrice : null,
          markup: null,
        }),
      );
      setPlans(mapped);
    } catch {
      toast("Failed to load plans — check your backend connection", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(company);
  }, [company]); // eslint-disable-line

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        plans.map((p) =>
          setCableTVCustomPrice(company, p.plan_id, calcFinal(p, globalMarkup)),
        ),
      );
      toast("All Cable TV prices saved");
    } catch {
      toast("Failed to save prices", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Cable TV Prices">
      <ToastContainer toasts={toasts} />

      {/* Company tabs */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {COMPANIES.map((c) => (
          <button
            key={c.key}
            className={`price-tab${company === c.key ? " active" : ""}`}
            onClick={() => setCompany(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Global Markup */}
      <div className="rule-box" style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: ".8px",
            marginBottom: 12,
          }}
        >
          ⚙ Global Auto-Markup — applied to all plans with no specific rule
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text2)", minWidth: 130 }}>
            Add ₦ to every plan
          </span>
          <input
            type="number"
            className="rule-input"
            min="0"
            style={{ width: 100 }}
            value={globalMarkup || ""}
            placeholder="e.g. 50"
            onChange={(e) => setGlobalMarkup(Number(e.target.value) || 0)}
          />
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            e.g. 50 → provider ₦9,000 becomes ₦9,050 automatically
          </span>
        </div>
      </div>

      {/* Plans table */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div className="section-title">
          {COMPANIES.find((c) => c.key === company)?.label} Plans
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-sm"
            onClick={() => load(company)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {saving ? <span className="spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <SmartPricingTable
          plans={plans}
          globalMarkup={globalMarkup}
          onSetFixed={setFixed}
          onSetMarkup={setMarkup}
          loading={loading}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 12,
          color: "var(--text3)",
          lineHeight: 1.8,
        }}
      >
        <strong style={{ color: "var(--text2)" }}>Pricing priority:</strong> ①{" "}
        <strong style={{ color: "#facc15" }}>Fixed Override</strong> → exact
        price, provider changes ignored. ②{" "}
        <strong style={{ color: "#60a5fa" }}>Auto-Markup</strong> → ea_price +
        markup, follows provider. ③{" "}
        <strong style={{ color: "var(--accent)" }}>Global Markup</strong> →
        applied to all remaining plans.
      </div>
    </AdminShell>
  );
}
