"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getUsers } from "@/lib/services";
import api from "@/lib/api";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { fmt } from "@/lib/utils";
import { Search, Wallet, RotateCcw, X } from "lucide-react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  balance: number;
  deleted: boolean;
}

type ActionType = "fund" | "refund";

interface ModalState {
  open: boolean;
  type: ActionType;
  user: User | null;
}

export default function WalletFundingPage() {
  const { toasts, toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "fund",
    user: null,
  });
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [txnId, setTxnId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data.filter((u: User) => !u.deleted)))
      .catch(() => toast("Failed to load users", "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.first_name + u.last_name + u.email + u.phone)
      .toLowerCase()
      .includes(q);
  });

  const openModal = (type: ActionType, user: User) => {
    setModal({ open: true, type, user });
    setAmount("");
    setNote("");
    setTxnId("");
  };

  const closeModal = () => {
    setModal({ open: false, type: "fund", user: null });
  };

  const handleSubmit = async () => {
    if (!modal.user) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast("Enter a valid amount", "error");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint =
        modal.type === "fund"
          ? "/api/admin/wallet/fund"
          : "/api/admin/wallet/refund";

      const payload: Record<string, unknown> = {
        user_id: modal.user.id,
        amount: amt,
        note: note || undefined,
      };
      if (modal.type === "refund" && txnId) {
        payload.transaction_id = Number(txnId);
      }

      const res = await api.post(endpoint, payload);

      toast(
        `${modal.type === "fund" ? "Funded" : "Refunded"} ${fmt(amt)} → ${modal.user.first_name} ${modal.user.last_name}`,
      );

      // Update balance in local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === modal.user!.id
            ? { ...u, balance: res.data.balance_after }
            : u,
        ),
      );

      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast(msg || "Failed to process request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Wallet Funding">
      <ToastContainer toasts={toasts} />

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>
            {users.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Wallet Balance</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>
            {fmt(users.reduce((s, u) => s + Number(u.balance), 0))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 10,
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
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 30, width: 220 }}
            />
          </div>
          <div
            style={{ marginLeft: "auto", fontSize: 13, color: "var(--text3)" }}
          >
            {filtered.length} users
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
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="mono">{u.email}</td>
                      <td className="mono">{u.phone}</td>
                      <td style={{ fontWeight: 600, color: "var(--success)" }}>
                        {fmt(u.balance)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn-sm btn-success"
                            onClick={() => openModal("fund", u)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <Wallet size={12} /> Fund
                          </button>
                          <button
                            className="btn-sm"
                            onClick={() => openModal("refund", u)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              borderColor: "#3b82f640",
                              color: "var(--info)",
                            }}
                          >
                            <RotateCcw size={12} /> Refund
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && modal.user && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal">
            <div className="modal-title">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {modal.type === "fund" ? (
                  <>
                    <Wallet size={18} color="var(--success)" /> Fund Wallet
                  </>
                ) : (
                  <>
                    <RotateCcw size={18} color="var(--info)" /> Issue Refund
                  </>
                )}
              </div>
              <button
                onClick={closeModal}
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

            {/* User info */}
            <div
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>
                  {modal.user.first_name} {modal.user.last_name}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 12, color: "var(--text3)" }}
                >
                  {modal.user.email}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>
                  Current Balance
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--success)",
                    fontFamily: "Syne, sans-serif",
                    fontSize: 18,
                  }}
                >
                  {fmt(modal.user.balance)}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">
                Amount (₦) <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {amount && Number(amount) > 0 && (
                <div
                  style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}
                >
                  Balance after:{" "}
                  <strong style={{ color: "var(--success)" }}>
                    {fmt(Number(modal.user.balance) + Number(amount))}
                  </strong>
                </div>
              )}
            </div>

            {/* Transaction ID (refund only) */}
            {modal.type === "refund" && (
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Transaction ID (optional)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Links refund to a specific transaction"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                />
              </div>
            )}

            {/* Note */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Note (optional)</label>
              <input
                className="form-input"
                placeholder={
                  modal.type === "fund"
                    ? "e.g. Bonus credit, correction..."
                    : "e.g. Failed transaction refund..."
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* What will show on user history */}
            <div
              style={{
                background: modal.type === "fund" ? "#22c55e0f" : "#3b82f60f",
                border: `1px solid ${modal.type === "fund" ? "#22c55e25" : "#3b82f625"}`,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 12,
                color: "var(--text2)",
              }}
            >
              This will appear on the user&apos;s history as{" "}
              <strong
                style={{
                  color:
                    modal.type === "fund" ? "var(--success)" : "var(--info)",
                }}
              >
                &quot;{modal.type === "fund" ? "Manual Funding" : "Refund"}
                &quot;
              </strong>
            </div>

            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button className="btn-sm" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  background:
                    modal.type === "fund" ? "var(--success)" : "var(--info)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {submitting ? (
                  <span className="spin" />
                ) : modal.type === "fund" ? (
                  <Wallet size={14} />
                ) : (
                  <RotateCcw size={14} />
                )}
                {submitting
                  ? "Processing…"
                  : modal.type === "fund"
                    ? "Fund Wallet"
                    : "Issue Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
