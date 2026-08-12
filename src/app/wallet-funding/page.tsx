"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getUsers } from "@/lib/services";
import api from "@/lib/api";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { fmt } from "@/lib/utils";
import { Search, Wallet, X } from "lucide-react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  balance: number;
  deleted: boolean;
}

export default function WalletFundingPage() {
  const { toasts, toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
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

  const openModal = (user: User) => {
    setSelectedUser(user);
    setAmount("");
    setNote("");
  };

  const closeModal = () => {
    setSelectedUser(null);
    setAmount("");
    setNote("");
  };

  const numAmount = Number(amount);
  const isDeposit = numAmount > 0;
  const isDebit = numAmount < 0;
  const absAmount = Math.abs(numAmount);
  const balanceAfter = selectedUser
    ? Number(selectedUser.balance) + numAmount
    : 0;

  const handleSubmit = async () => {
    if (!selectedUser) return;
    if (!amount || isNaN(numAmount) || numAmount === 0) {
      toast(
        "Enter a valid amount (positive to deposit, negative to debit)",
        "error",
      );
      return;
    }
    if (balanceAfter < 0) {
      toast(
        `Cannot deduct — user only has ${fmt(selectedUser.balance)}`,
        "error",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/admin/wallet/fund", {
        user_id: selectedUser.id,
        amount: numAmount,
        note: note || undefined,
      });

      toast(res.data.message);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
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
    <AdminShell title="Fund / Debit Wallet">
      <ToastContainer toasts={toasts} />

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
                  <th>Action</th>
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
                        <button
                          className="btn-sm"
                          onClick={() => openModal(u)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            borderColor: "#f9731640",
                            color: "var(--accent)",
                          }}
                        >
                          <Wallet size={12} /> Fund / Debit
                        </button>
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

      {selectedUser && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-title">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Wallet size={18} color="var(--accent)" /> Fund / Debit Wallet
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

            <div
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {selectedUser.first_name} {selectedUser.last_name}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 12, color: "var(--text3)" }}
                >
                  {selectedUser.email}
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
                    fontSize: 20,
                  }}
                >
                  {fmt(selectedUser.balance)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 6 }}>
              <label className="form-label">
                Amount (₦) — positive to deposit, negative to debit
              </label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 500 or -200"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>

            {amount && !isNaN(numAmount) && numAmount !== 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  background: isDeposit ? "#22c55e0f" : "#ef44440f",
                  border: `1px solid ${isDeposit ? "#22c55e25" : "#ef444425"}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--text3)" }}>Type: </span>
                  <strong
                    style={{
                      color: isDeposit ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {isDeposit ? "Deposit" : "Debit"}
                  </strong>
                </div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--text3)" }}>Amount: </span>
                  <strong>{fmt(absAmount)}</strong>
                </div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: "var(--text3)" }}>Balance after: </span>
                  <strong
                    style={{
                      color:
                        balanceAfter < 0 ? "var(--danger)" : "var(--success)",
                    }}
                  >
                    {fmt(balanceAfter)}
                  </strong>
                  {balanceAfter < 0 && (
                    <span
                      style={{
                        color: "var(--danger)",
                        marginLeft: 6,
                        fontSize: 11,
                      }}
                    >
                      ⚠ insufficient
                    </span>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">
                Note (optional — shown in user history)
              </label>
              <input
                className="form-input"
                placeholder={
                  isDebit
                    ? "e.g. Erroneous credit reversal"
                    : "e.g. Bonus credit, correction..."
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div
              style={{
                fontSize: 12,
                color: "var(--text3)",
                marginBottom: 20,
                padding: "8px 12px",
                background: "var(--surface2)",
                borderRadius: 6,
                border: "1px solid var(--border)",
              }}
            >
              This will appear on the user&apos;s transaction history as{" "}
              <strong
                style={{
                  color: isDeposit ? "var(--success)" : "var(--danger)",
                }}
              >
                &quot;{isDeposit ? "Deposit" : isDebit ? "Debit" : "—"}&quot;
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
                disabled={
                  submitting ||
                  !amount ||
                  isNaN(numAmount) ||
                  numAmount === 0 ||
                  balanceAfter < 0
                }
                style={{
                  background: isDeposit
                    ? "var(--success)"
                    : isDebit
                      ? "var(--danger)"
                      : "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {submitting ? <span className="spin" /> : <Wallet size={14} />}
                {submitting
                  ? "Processing…"
                  : isDeposit
                    ? "Deposit"
                    : isDebit
                      ? "Debit"
                      : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
