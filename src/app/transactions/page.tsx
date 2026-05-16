"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getTransactions, updateTransaction } from "@/lib/services";
import { fmt, fmtDateTime } from "@/lib/utils";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface Txn {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  reference: string;
  type: string;
  amount: number;
  api_amount: number;
  status: string;
  network: string | null;
  plan: string | null;
  phone: string | null;
  via: string | null;
  description: string | null;
  balance_before: number;
  balance_after: number;
  message_id: string | null;
  api_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  airtime: "badge-info",
  data: "badge-orange",
  cabletv: "badge-warn",
  electricity: "badge-success",
  sms: "badge-gray",
  education: "badge-gray",
  wallet: "badge-gray",
};

function Detail({
  label,
  value,
  mono,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text3)",
          textTransform: "uppercase",
          letterSpacing: ".6px",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        className={mono ? "mono" : ""}
        style={{
          fontSize: 13,
          color: color ?? "var(--text)",
          wordBreak: "break-all",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { toasts, toast } = useToast();
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    try {
      const res = await getTransactions();
      setTxns(res.data);
    } catch {
      toast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const filtered = txns.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (typeFilter && t.type !== typeFilter) return false;
    const q = search.toLowerCase();
    return (
      t.first_name +
      t.last_name +
      t.email +
      (t.description ?? "") +
      t.reference +
      (t.network ?? "") +
      (t.plan ?? "") +
      (t.phone ?? "")
    )
      .toLowerCase()
      .includes(q);
  });

  const handleStatus = async (id: number, status: "success" | "failed") => {
    setUpdating(id);
    try {
      await updateTransaction(id, status);
      toast(
        `Transaction marked as ${status}`,
        status === "success" ? "success" : "error",
      );
      setTxns((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch {
      toast("Failed to update transaction", "error");
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (id: number) =>
    setExpanded((prev) => (prev === id ? null : id));

  const types = [...new Set(txns.map((t) => t.type))];

  const totalSuccess = txns
    .filter((t) => t.status === "success")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalPending = txns.filter((t) => t.status === "pending").length;
  const totalFailed = txns.filter((t) => t.status === "failed").length;

  return (
    <AdminShell title="Transactions">
      <ToastContainer toasts={toasts} />

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Total Records", value: txns.length, color: "var(--text)" },
          {
            label: "Success Volume",
            value: fmt(totalSuccess),
            color: "var(--success)",
          },
          { label: "Pending", value: totalPending, color: "var(--warning)" },
          { label: "Failed", value: totalFailed, color: "var(--danger)" },
        ].map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ padding: "14px 16px" }}
          >
            <div className="stat-label">{s.label}</div>
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: s.color,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        {/* Filters */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text3)",
              }}
            />
            <input
              className="form-input"
              placeholder="Search ref, user, plan…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 30, width: 220 }}
            />
          </div>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 130 }}
          >
            <option value="">All status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            className="form-input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 130 }}
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div
            style={{ marginLeft: "auto", fontSize: 13, color: "var(--text3)" }}
          >
            {filtered.length} of {txns.length} records
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <span className="spin" />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 32 }} />
                  <th>User</th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Network</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Via</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.flatMap((t) => {
                    const profit = Number(t.amount) - Number(t.api_amount ?? 0);
                    const rows = [
                      <tr
                        key={t.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleExpand(t.id)}
                      >
                        {/* Chevron */}
                        <td style={{ color: "var(--text3)", paddingRight: 0 }}>
                          {expanded === t.id ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </td>

                        {/* User */}
                        <td>
                          <div
                            style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                          >
                            {t.first_name} {t.last_name}
                          </div>
                          <div
                            className="mono"
                            style={{ color: "var(--text3)", fontSize: 11 }}
                          >
                            {t.email}
                          </div>
                        </td>

                        {/* Reference */}
                        <td
                          className="mono"
                          style={{
                            fontSize: 11,
                            color: "var(--text2)",
                            maxWidth: 130,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={t.reference}
                        >
                          {t.reference}
                        </td>

                        {/* Type */}
                        <td>
                          <span
                            className={`badge ${TYPE_COLORS[t.type] ?? "badge-gray"}`}
                          >
                            {t.type}
                          </span>
                        </td>

                        {/* Network */}
                        <td style={{ color: "var(--text2)", fontSize: 12 }}>
                          {t.network || "—"}
                        </td>

                        {/* Amount */}
                        <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                          {fmt(t.amount)}
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`badge ${
                              t.status === "success"
                                ? "badge-success"
                                : t.status === "failed"
                                  ? "badge-danger"
                                  : "badge-warn"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="mono" style={{ whiteSpace: "nowrap" }}>
                          {t.phone || "—"}
                        </td>

                        {/* Via */}
                        <td>
                          <span className="badge badge-gray">
                            {t.via || "wallet"}
                          </span>
                        </td>

                        {/* Date */}
                        <td
                          style={{
                            color: "var(--text3)",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtDateTime(t.created_at)}
                        </td>

                        {/* Actions — stop propagation so click doesn't toggle expand */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {updating === t.id ? (
                              <span className="spin" />
                            ) : (
                              <>
                                <button
                                  className="btn-sm btn-success"
                                  onClick={() => handleStatus(t.id, "success")}
                                  title="Mark success"
                                >
                                  <CheckCircle size={12} />
                                </button>
                                <button
                                  className="btn-sm btn-danger"
                                  onClick={() => handleStatus(t.id, "failed")}
                                  title="Mark failed"
                                >
                                  <XCircle size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>,
                    ];

                    if (expanded === t.id) {
                      rows.push(
                        <tr key={`${t.id}-detail`}>
                          <td
                            colSpan={11}
                            style={{
                              background: "var(--surface2)",
                              padding: "16px 20px",
                              borderTop: "none",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit,minmax(160px,1fr))",
                                gap: 16,
                              }}
                            >
                              <Detail label="Plan" value={t.plan || "—"} />
                              <Detail
                                label="API Cost"
                                value={fmt(t.api_amount ?? 0)}
                              />
                              <Detail
                                label="Profit"
                                value={(profit >= 0 ? "+" : "") + fmt(profit)}
                                color={
                                  profit >= 0
                                    ? "var(--success)"
                                    : "var(--danger)"
                                }
                              />
                              <Detail
                                label="Balance Before"
                                value={fmt(t.balance_before)}
                              />
                              <Detail
                                label="Balance After"
                                value={fmt(t.balance_after)}
                              />
                              <Detail
                                label="Description"
                                value={t.description || "—"}
                              />
                              <Detail
                                label="Message ID"
                                value={t.message_id || "—"}
                                mono
                              />
                              <Detail
                                label="Full Reference"
                                value={t.reference}
                                mono
                              />
                              <Detail
                                label="Updated At"
                                value={fmtDateTime(t.updated_at)}
                              />
                            </div>
                            {t.api_response && (
                              <div style={{ marginTop: 14 }}>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text3)",
                                    textTransform: "uppercase",
                                    letterSpacing: ".6px",
                                    marginBottom: 6,
                                  }}
                                >
                                  API Response
                                </div>
                                <pre
                                  style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 8,
                                    padding: "12px 14px",
                                    fontSize: 12,
                                    color: "var(--text2)",
                                    overflowX: "auto",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-all",
                                    fontFamily: "DM Mono, monospace",
                                    maxHeight: 220,
                                    overflowY: "auto",
                                  }}
                                >
                                  {JSON.stringify(t.api_response, null, 2)}
                                </pre>
                              </div>
                            )}
                          </td>
                        </tr>,
                      );
                    }

                    return rows;
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="empty-state">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
