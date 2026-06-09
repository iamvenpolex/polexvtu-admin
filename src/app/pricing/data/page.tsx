"use client";
import { useEffect, useState, useMemo } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import {
  getDataPlans,
  bulkSetDataPrices,
  getGlobalMarkup,
  setGlobalMarkup,
  getDataPlanStatus,
  syncAllDataPlans,
  deleteAllDataPlans,
} from "@/lib/services";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { Save, RefreshCw, Search, Trash2, RotateCcw } from "lucide-react";
import { fmt } from "@/lib/utils";

const MIN_MARGIN = 5;

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

interface Plan {
  plan_id: string;
  name: string;
  price: number;
  validity: string;
  markup: number;
  custom_price: number;
}

interface PlanRow extends Plan {
  localMarkup: string;
}

export default function DataPricingPage() {
  const { toasts, toast } = useToast();
  const [productType, setProductType] = useState("mtn_sme");
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Global markup
  const [globalMarkup, setGlobalMarkupVal] = useState<number>(0);
  const [globalInput, setGlobalInput] = useState<string>("0");
  const [savingGlobal, setSavingGlobal] = useState(false);

  // Sync / delete state
  const [hasPlans, setHasPlans] = useState<boolean | null>(null);
  const [totalPlans, setTotalPlans] = useState(0);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [syncSummary, setSyncSummary] = useState<Record<
    string,
    { synced: number; error?: string }
  > | null>(null);

  // ── load: used for manual triggers (Refresh, after Save, after Sync) ──
  const load = async (pt: string) => {
    setLoading(true);
    try {
      const res = await getDataPlans(pt);
      const plans: Plan[] = res.data.plans || [];
      setRows(
        plans.map((p) => ({
          ...p,
          localMarkup: String(p.markup ?? globalMarkup),
        })),
      );
    } catch {
      toast("Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── On mount: check status + load global markup ──────────
  useEffect(() => {
    const init = async () => {
      try {
        const res = await getDataPlanStatus();
        setHasPlans(res.data.hasPlans);
        setTotalPlans(res.data.total);
      } catch {
        setHasPlans(false);
      }
      try {
        const res = await getGlobalMarkup();
        const m = Number(res.data.markup || 0);
        setGlobalMarkupVal(m);
        setGlobalInput(String(m));
      } catch {
        /* non-critical */
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load plans when product type changes ─────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await getDataPlans(productType);
        if (cancelled) return;
        const plans: Plan[] = res.data.plans || [];
        setRows(
          plans.map((p) => ({
            ...p,
            localMarkup: String(p.markup ?? globalMarkup),
          })),
        );
      } catch {
        if (!cancelled) toast("Failed to load plans", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPlans();
    return () => {
      cancelled = true;
    };
  }, [productType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync all ─────────────────────────────────────────────
  async function handleSync() {
    if (hasPlans) return;
    setSyncing(true);
    setSyncSummary(null);
    try {
      const res = await syncAllDataPlans();
      const data = res.data;
      if (data.success) {
        setHasPlans(data.total > 0);
        setTotalPlans(data.total);
        setSyncSummary(data.summary);
        setLastSynced(new Date(data.synced_at).toLocaleString());
        toast(
          `Synced ${data.total} plans — all inactive, activate before users can buy`,
        );
        await load(productType);
      } else {
        toast(data.message || "Sync failed", "error");
      }
    } catch {
      toast("Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  }

  // ── Delete all ───────────────────────────────────────────
  async function handleDeleteAll() {
    if (!hasPlans) return;
    if (
      !confirm(
        "Delete ALL data plans? Users cannot buy data until you sync again.",
      )
    )
      return;
    setDeleting(true);
    setSyncSummary(null);
    try {
      const res = await deleteAllDataPlans();
      const data = res.data;
      if (data.success) {
        setHasPlans(false);
        setTotalPlans(0);
        setRows([]);
        toast(data.message);
      } else {
        toast(data.message || "Delete failed", "error");
      }
    } catch {
      toast("Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  }

  // ── Markup helpers ───────────────────────────────────────
  const computeFinal = (apiPrice: number, markupStr: string) => {
    const m = Number(markupStr) || 0;
    return Math.max(apiPrice + m, apiPrice + MIN_MARGIN);
  };

  const handleMarkupChange = (planId: string, val: string) => {
    setRows((prev) =>
      prev.map((r) => (r.plan_id === planId ? { ...r, localMarkup: val } : r)),
    );
  };

  const applyGlobalToAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, localMarkup: globalInput })));
  };

  const handleSaveGlobal = async () => {
    const val = Number(globalInput);
    if (isNaN(val) || val < 0) {
      toast("Enter a valid markup", "error");
      return;
    }
    setSavingGlobal(true);
    try {
      await setGlobalMarkup(val);
      setGlobalMarkupVal(val);
      toast("Global markup saved");
    } catch {
      toast("Failed to save global markup", "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = rows.map((r) => ({
        plan_id: r.plan_id,
        plan_name: r.name,
        markup: Number(r.localMarkup) || 0,
        status: "active",
      }));
      await bulkSetDataPrices(productType, payload);
      toast("All markups saved successfully");
      await load(productType);
    } catch {
      toast("Failed to save markups", "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(
    () =>
      rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );

  const isBusy = syncing || deleting;

  return (
    <AdminShell title="Data Prices">
      <ToastContainer toasts={toasts} />

      {/* ── Sync / Delete Panel ───────────────────────────── */}
      <div className="rule-box" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Left: status + last synced */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                backgroundColor:
                  hasPlans === null
                    ? "var(--bg2)"
                    : hasPlans
                      ? "#e6f4ea"
                      : "#fce8e6",
                color:
                  hasPlans === null
                    ? "var(--text3)"
                    : hasPlans
                      ? "#1e7e34"
                      : "#c0392b",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  display: "inline-block",
                  backgroundColor:
                    hasPlans === null
                      ? "var(--text3)"
                      : hasPlans
                        ? "#28a745"
                        : "#e74c3c",
                }}
              />
              {hasPlans === null
                ? "Checking…"
                : hasPlans
                  ? `${totalPlans} plans in DB`
                  : "DB is empty"}
            </div>
            {lastSynced && (
              <span style={{ fontSize: 12, color: "var(--text3)" }}>
                Last synced: {lastSynced}
              </span>
            )}
          </div>

          {/* Right: action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {/* Fetch & Sync — only active when DB is empty */}
            <button
              className="btn-primary"
              onClick={handleSync}
              disabled={isBusy || hasPlans === null || hasPlans === true}
              title={
                hasPlans
                  ? "Delete all plans first before syncing"
                  : "Fetch fresh plans from provider"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity:
                  isBusy || hasPlans === null || hasPlans === true ? 0.4 : 1,
                cursor:
                  isBusy || hasPlans === null || hasPlans === true
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {syncing ? <span className="spin" /> : <RotateCcw size={13} />}
              {syncing ? "Syncing…" : "Fetch & Sync"}
            </button>

            {/* Delete All — only active when DB has plans */}
            <button
              className="btn-sm"
              onClick={handleDeleteAll}
              disabled={isBusy || hasPlans === null || hasPlans === false}
              title={!hasPlans ? "Nothing to delete" : "Wipe all plans from DB"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color:
                  !isBusy && hasPlans ? "var(--danger, #e74c3c)" : undefined,
                opacity:
                  isBusy || hasPlans === null || hasPlans === false ? 0.4 : 1,
                cursor:
                  isBusy || hasPlans === null || hasPlans === false
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {deleting ? <span className="spin" /> : <Trash2 size={13} />}
              {deleting ? "Deleting…" : "Delete All"}
            </button>
          </div>
        </div>

        {/* Helper hint */}
        {hasPlans !== null && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text3)",
              margin: "10px 0 0 0",
            }}
          >
            {hasPlans
              ? "To sync fresh plans from provider — delete all first, then click Fetch & Sync."
              : "DB is empty. Click Fetch & Sync to pull all plans from the provider."}
          </p>
        )}

        {/* Sync summary */}
        {syncSummary && (
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              backgroundColor: "var(--bg2)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text2)",
                margin: "0 0 10px 0",
              }}
            >
              Sync summary
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              {Object.entries(syncSummary).map(([network, info]) => (
                <div
                  key={network}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: `1px solid ${info.error ? "#e74c3c" : "#28a745"}`,
                    color: info.error ? "#e74c3c" : "#1e7e34",
                    backgroundColor: info.error ? "#fce8e6" : "#e6f4ea",
                  }}
                >
                  <strong>{network}</strong>:{" "}
                  {info.error ? `❌ ${info.error}` : `✅ ${info.synced} plans`}
                </div>
              ))}
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#92400e",
                backgroundColor: "#fffbeb",
                border: "1px solid #fcd34d",
                borderRadius: 6,
                padding: "7px 10px",
                margin: 0,
              }}
            >
              ⚠️ All synced plans are <strong>inactive</strong>. Use Save All
              below to set markups and activate them.
            </p>
          </div>
        )}
      </div>

      {/* ── Product type tabs ─────────────────────────────── */}
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

      {/* ── Global markup box ─────────────────────────────── */}
      <div className="rule-box" style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: ".8px",
            marginBottom: 14,
          }}
        >
          ⚙ Global Markup — fallback for all plans with no per-plan rule
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>Add ₦</span>
            <input
              type="number"
              className="rule-input"
              min="0"
              style={{ width: 90 }}
              value={globalInput}
              onChange={(e) => setGlobalInput(e.target.value)}
              placeholder="e.g. 5"
            />
            <span style={{ fontSize: 13, color: "var(--text2)" }}>
              to every plan
            </span>
          </div>
          <button
            className="btn-primary"
            onClick={handleSaveGlobal}
            disabled={savingGlobal}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {savingGlobal ? <span className="spin" /> : <Save size={13} />}
            Save Global
          </button>
          <button
            className="btn-sm"
            onClick={applyGlobalToAll}
            title="Apply this markup to every plan in the table below"
          >
            Apply to all plans below
          </button>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            Current saved:{" "}
            <strong style={{ color: "var(--accent)" }}>₦{globalMarkup}</strong>
          </span>
        </div>
      </div>

      {/* ── Table header ──────────────────────────────────── */}
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
          <div style={{ position: "relative" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 9,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text3)",
              }}
            />
            <input
              className="form-input"
              placeholder="Search plans…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: 28,
                width: 180,
                fontSize: 13,
                padding: "6px 10px 6px 28px",
              }}
            />
          </div>
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
            onClick={handleSaveAll}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {saving ? <span className="spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      {/* ── Plans table ───────────────────────────────────── */}
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
                  <th>Plan Name</th>
                  <th>Validity</th>
                  <th>Provider Price</th>
                  <th title="Amount you add on top of provider price">
                    Your Markup (₦)
                  </th>
                  <th>User Pays</th>
                  <th>Your Profit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((r) => {
                    const final = computeFinal(r.price, r.localMarkup);
                    const profit = final - r.price;
                    const changed = String(r.markup) !== r.localMarkup;

                    return (
                      <tr key={r.plan_id}>
                        <td style={{ fontWeight: 500 }}>
                          {r.name}
                          {changed && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 10,
                                color: "var(--accent)",
                                border: "1px solid var(--accent)",
                                borderRadius: 4,
                                padding: "1px 5px",
                                verticalAlign: "middle",
                              }}
                            >
                              edited
                            </span>
                          )}
                        </td>
                        <td style={{ color: "var(--text2)", fontSize: 12 }}>
                          {r.validity || "—"}
                        </td>
                        <td className="mono" style={{ color: "var(--text2)" }}>
                          {fmt(r.price)}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{ fontSize: 12, color: "var(--text3)" }}
                            >
                              +₦
                            </span>
                            <input
                              type="number"
                              className="rule-input"
                              min="0"
                              style={{ width: 80 }}
                              value={r.localMarkup}
                              onChange={(e) =>
                                handleMarkupChange(r.plan_id, e.target.value)
                              }
                              placeholder={String(globalMarkup)}
                            />
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                          {fmt(final)}
                        </td>
                        <td
                          style={{
                            fontSize: 13,
                            color:
                              profit > 0
                                ? "var(--success)"
                                : profit < 0
                                  ? "var(--danger)"
                                  : "var(--text3)",
                          }}
                        >
                          {profit >= 0 ? "+" : ""}
                          {fmt(profit)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      {hasPlans === false
                        ? "No plans in database — sync to fetch from provider."
                        : "No plans found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Legend ────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 14,
          fontSize: 12,
          color: "var(--text3)",
          lineHeight: 1.9,
        }}
      >
        <strong style={{ color: "var(--text2)" }}>How it works:</strong>
        <br />
        Set a markup (₦) per plan.{" "}
        <strong style={{ color: "var(--text)" }}>
          User pays = Provider price + Markup
        </strong>{" "}
        — so if the provider raises their price tomorrow, your profit stays the
        same automatically.
        <br />
        The global markup above is the default. Per-plan markups override it for
        that specific plan.
        <br />
        Minimum profit enforced by backend:{" "}
        <strong style={{ color: "var(--accent)" }}>₦{MIN_MARGIN}</strong> per
        plan.
      </div>
    </AdminShell>
  );
}
