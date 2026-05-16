"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getUsers, updateUser, deleteUser, restoreUser } from "@/lib/services";
import { fmt, fmtDate } from "@/lib/utils";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { Search, RotateCcw, Pencil, Trash2, X } from "lucide-react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  balance: number;
  reward: number;
  role: string;
  created_at: string;
  deleted: boolean;
}

interface EditForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  balance: number;
  reward: number;
  role: string;
}

export default function UsersPage() {
  const { toasts, toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    balance: 0,
    reward: 0,
    role: "user",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const filtered = users.filter((u) => {
    if (!showDeleted && u.deleted) return false;
    const q = search.toLowerCase();
    return (u.first_name + u.last_name + u.email + u.phone)
      .toLowerCase()
      .includes(q);
  });

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      balance: u.balance,
      reward: u.reward,
      role: u.role,
    });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await updateUser(editUser.id, form);
      toast("User updated successfully");
      setEditUser(null);
      load();
    } catch {
      toast("Failed to update user", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (
      !confirm(
        `Soft-delete ${u.first_name} ${u.last_name}? Their data will be masked.`,
      )
    )
      return;
    try {
      await deleteUser(u.id);
      toast("User deleted & masked", "error");
      load();
    } catch {
      toast("Failed to delete user", "error");
    }
  };

  const handleRestore = async (u: User) => {
    try {
      await restoreUser(u.id);
      toast("User restored successfully");
      load();
    } catch {
      toast("Failed to restore user", "error");
    }
  };

  return (
    <AdminShell title="User Management">
      <ToastContainer toasts={toasts} />

      <div className="table-wrap">
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
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
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--text2)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            Show deleted
          </label>
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Reward</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="mono">{u.email}</td>
                      <td className="mono">{u.phone}</td>
                      <td style={{ fontWeight: 500 }}>{fmt(u.balance)}</td>
                      <td>{fmt(u.reward)}</td>
                      <td>
                        <span
                          className={`badge ${u.role === "admin" ? "badge-warn" : "badge-info"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${u.deleted ? "badge-danger" : "badge-success"}`}
                        >
                          {u.deleted ? "Deleted" : "Active"}
                        </span>
                      </td>
                      <td style={{ color: "var(--text3)", fontSize: 12 }}>
                        {fmtDate(u.created_at)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {!u.deleted ? (
                            <>
                              <button
                                className="btn-sm"
                                onClick={() => openEdit(u)}
                                title="Edit"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                className="btn-sm btn-danger"
                                onClick={() => handleDelete(u)}
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn-sm btn-success"
                              onClick={() => handleRestore(u)}
                              title="Restore"
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="empty-state">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditUser(null);
          }}
        >
          <div className="modal">
            <div className="modal-title">
              Edit User
              <button
                onClick={() => setEditUser(null)}
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
                <label className="form-label">First Name</label>
                <input
                  className="form-input"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, first_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, last_name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 12,
              }}
            >
              <div>
                <label className="form-label">Balance (₦)</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.balance}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, balance: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <label className="form-label">Reward (₦)</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.reward}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reward: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="form-label">Role</label>
              <select
                className="form-input"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button className="btn-sm" onClick={() => setEditUser(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spin" style={{ marginRight: 6 }} />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
