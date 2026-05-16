"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getTransactions, updateTransaction } from "@/lib/services";
import { fmt, fmtDateTime } from "@/lib/utils";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { Search, CheckCircle, XCircle } from "lucide-react";

interface Txn {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  amount: number;
  status: string;
  phone: string;
  description: string;
  created_at: string;
  reference: string;
}

export default function TransactionsPage() {
  const { toasts, toast } = useToast();
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

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
    return (t.first_name + t.last_name + t.email + t.description + t.reference)
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

  const types = [...new Set(txns.map((t) => t.type))];

  return (
    <AdminShell title="Transactions">
      <ToastContainer toasts={toasts} />

      <div className="table-wrap">
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
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 30, width: 200 }}
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
            {filtered.length} records
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
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                          {t.first_name} {t.last_name}
                        </div>
                        <div
                          className="mono"
                          style={{ color: "var(--text3)", fontSize: 11 }}
                        >
                          {t.email}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{t.type}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{fmt(t.amount)}</td>
                      <td>
                        <span
                          className={`badge ${t.status === "success" ? "badge-success" : t.status === "failed" ? "badge-danger" : "badge-warn"}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="mono">{t.phone || "—"}</td>
                      <td
                        style={{
                          color: "var(--text2)",
                          fontSize: 12,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.description || "—"}
                      </td>
                      <td
                        style={{
                          color: "var(--text3)",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtDateTime(t.created_at)}
                      </td>
                      <td>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="empty-state">
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
