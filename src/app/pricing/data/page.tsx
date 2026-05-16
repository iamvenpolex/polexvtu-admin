"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getDataPlans, bulkSetDataPrices } from "@/lib/services";
import { SmartPricingTable } from "@/components/ui/SmartPricingTable";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { useSmartPricing, calcFinal, Plan } from "@/hooks/useSmartPricing";
import { Save, RefreshCw } from "lucide-react";

const PRODUCT_TYPES = [
  { key: "mtn_sme", label: "MTN SME" },
  { key: "mtn_cg_lite", label: "MTN CG Lite" },
  { key: "mtn_cg", label: "MTN CG" },
  { key: "mtn_awoof", label: "MTN Awoof" },
  { key: "mtn_gifting", label: "MTN Gifting" },
  { key: "glo_cg", label: "Glo CG" },
  { key: "glo_awoof", label: "Glo Awoof" },
  { key: "glo_gifting", label: "Glo Gifting" },
  { key: "airtel_cg", label: "Airtel CG" },
  { key: "airtel_awoof", label: "Airtel Awoof" },
  { key: "airtel_gifting", label: "Airtel Gifting" },
  { key: "9mobile_sme", label: "9Mobile SME" },
  { key: "9mobile_gifting", label: "9Mobile Gifting" },
];

export default function DataPricingPage() {
  const { toasts, toast } = useToast();
  const [productType, setProductType] = useState("mtn_sme");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const {
    plans,
    setPlans,
    globalMarkup,
    setGlobalMarkup,
    setFixed,
    setMarkup,
    getPlansForSave,
  } = useSmartPricing();

  const load = async (pt: string) => {
    setLoading(true);
    try {
      const res = await getDataPlans(pt);
      const rawPlans = res.data.plans || [];
      const mapped: Plan[] = rawPlans.map(
        (p: {
          plan_id: string;
          name: string;
          price: number;
          custom_price?: number;
          validity?: string;
        }) => ({
          plan_id: p.plan_id,
          name: p.name + (p.validity ? ` (${p.validity})` : ""),
          ea_price: p.price,
          fixed_price:
            p.custom_price && p.custom_price !== p.price
              ? p.custom_price
              : null,
          markup: null,
        }),
      );
      setPlans(mapped);
    } catch {
      toast("Failed to load data plans — check backend", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(productType);
  }, [productType]); // eslint-disable-line

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = getPlansForSave();
      await bulkSetDataPrices(productType, payload);
      toast("Data prices saved successfully");
    } catch {
      toast("Failed to save prices", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredPlans = plans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminShell title="Data Prices">
      <ToastContainer toasts={toasts} />

      {/* Product type selector */}
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}
      >
        {PRODUCT_TYPES.map((pt) => (
          <button
            key={pt.key}
            className={`price-tab${productType === pt.key ? " active" : ""}`}
            onClick={() => {
              setProductType(pt.key);
              setSearch("");
            }}
          >
            {pt.label}
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
            placeholder="e.g. 10"
            onChange={(e) => setGlobalMarkup(Number(e.target.value) || 0)}
          />
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            Provider raises ₦230 → ₦250? Your price auto-becomes ₦260 (with +10
            markup)
          </span>
        </div>
      </div>

      {/* Header + search + save */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="section-title">
            {PRODUCT_TYPES.find((p) => p.key === productType)?.label} Plans
          </div>
          <input
            className="form-input"
            placeholder="Search plans…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 180, fontSize: 13, padding: "6px 10px" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-sm"
            onClick={() => load(productType)}
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
          plans={filteredPlans}
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
        price, ignores provider changes. ②{" "}
        <strong style={{ color: "#60a5fa" }}>Auto-Markup</strong> → ea_price +
        markup, follows provider automatically. ③{" "}
        <strong style={{ color: "var(--accent)" }}>Global Markup</strong> →
        fallback for all unset plans.
      </div>
    </AdminShell>
  );
}
