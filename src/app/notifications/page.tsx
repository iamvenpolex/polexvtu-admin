"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Megaphone,
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "announcement";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://polexvtu-backend.onrender.com";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<Notification["type"]>("info");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // Get admin token
  // --------------------------------------------------

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  };

  // --------------------------------------------------
  // Fetch notifications
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setError("Admin session not found.");
          setLoading(false);
        }

        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!cancelled) {
          setNotifications(response.data.notifications || []);
          setError("");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          if (axios.isAxiosError(err)) {
            setError(
              err.response?.data?.message || "Failed to load notifications.",
            );
          } else {
            setError("Failed to load notifications.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // Create notification
  // --------------------------------------------------

  const createNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a notification title.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a notification message.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Admin session not found.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/notifications`,
        {
          title: title.trim(),
          message: message.trim(),
          type,
          is_active: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const newNotification = response.data.notification;

      if (newNotification) {
        setNotifications((prev) => [newNotification, ...prev]);
      } else {
        // Refresh if backend doesn't return the created record
        await fetchNotifications();
      }

      setTitle("");
      setMessage("");
      setType("info");
      setShowForm(false);

      setSuccess("Notification created successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to create notification.",
        );
      } else {
        setError("Failed to create notification.");
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Fetch helper
  // --------------------------------------------------

  const fetchNotifications = async () => {
    const token = getToken();

    if (!token) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    }
  };

  // --------------------------------------------------
  // Delete notification
  // --------------------------------------------------

  const deleteNotification = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this notification?",
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      setError("Admin session not found.");
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await axios.delete(`${API_BASE_URL}/api/admin/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );

      setSuccess("Notification deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to delete notification.",
        );
      } else {
        setError("Failed to delete notification.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // Toggle active status
  // --------------------------------------------------

  const toggleNotification = async (notification: Notification) => {
    const token = getToken();

    if (!token) {
      setError("Admin session not found.");
      return;
    }

    try {
      setUpdatingId(notification.id);
      setError("");

      const newStatus = !notification.is_active;

      const response = await axios.patch(
        `${API_BASE_URL}/api/admin/notifications/${notification.id}`,
        {
          is_active: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const updatedNotification = response.data.notification;

      if (updatedNotification) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? updatedNotification : item,
          ),
        );
      } else {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_active: newStatus,
                }
              : item,
          ),
        );
      }

      setSuccess(
        newStatus
          ? "Notification is now visible to users."
          : "Notification has been hidden from users.",
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to update notification.",
        );
      } else {
        setError("Failed to update notification.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // --------------------------------------------------
  // Notification icon
  // --------------------------------------------------

  const getTypeIcon = (notificationType: Notification["type"]) => {
    switch (notificationType) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;

      case "warning":
        return <AlertCircle size={20} className="text-yellow-600" />;

      case "error":
        return <AlertCircle size={20} className="text-red-600" />;

      case "announcement":
        return <Megaphone size={20} className="text-orange-600" />;

      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  // --------------------------------------------------
  // Format date
  // --------------------------------------------------

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return date;
    }
  };

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                <Bell size={23} className="text-orange-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Dashboard Notifications
                </h1>

                <p className="text-sm text-gray-500">
                  Send information and announcements to all TapAm users.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setError("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            <Plus size={18} />
            New Notification
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Information card */}
        <div className="mb-6 rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <div className="flex gap-3">
            <Bell size={20} className="mt-0.5 shrink-0 text-orange-600" />

            <div>
              <p className="text-sm font-semibold text-orange-800">
                How dashboard notifications work
              </p>

              <p className="mt-1 text-xs leading-relaxed text-orange-700">
                Notifications created here are displayed to all users when they
                open their dashboard. Deactivating a notification hides it from
                users without deleting it.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Saved Notifications
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {notifications.length} notification
                  {notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={28} className="animate-spin text-orange-600" />

                <p className="text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                <Bell size={28} className="text-orange-500" />
              </div>

              <h3 className="font-semibold text-gray-800">
                No notifications yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Create a notification to display an announcement or important
                information to all users.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Create Notification
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        {getTypeIcon(notification.type)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                              notification.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {notification.is_active ? "Active" : "Hidden"}
                          </span>

                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-orange-600">
                            {notification.type}
                          </span>
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                          {notification.message}
                        </p>

                        <p className="mt-3 text-xs text-gray-400">
                          Created {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleNotification(notification)}
                        disabled={updatingId === notification.id}
                        title={
                          notification.is_active
                            ? "Hide from users"
                            : "Show to users"
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50 ${
                          notification.is_active
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {updatingId === notification.id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : notification.is_active ? (
                          <Power size={17} />
                        ) : (
                          <PowerOff size={17} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        disabled={deletingId === notification.id}
                        title="Delete notification"
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === notification.id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-gray-900">New Notification</h2>

                <p className="mt-1 text-xs text-gray-500">
                  This notification will be available to all users.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={createNotification} className="space-y-5 p-5">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Notification Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Important Update"
                  maxLength={255}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write the information you want users to see..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Notification Type
                </label>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as Notification["type"])
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="info">Information</option>

                  <option value="announcement">Announcement</option>

                  <option value="success">Success</option>

                  <option value="warning">Warning</option>

                  <option value="error">Important / Error</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Bell size={17} />
                      Publish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
