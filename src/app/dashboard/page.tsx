"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getOverview, getIncome } from "@/lib/services";
import { fmt } from "@/lib/utils";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, ArrowLeftRight, TrendingUp, CreditCard } from "lucide-react";

interface Overview {
  users: number;
  transactions: number;
  revenue: number;
}

interface IncomeData {
  labels: string[];
  totals: number[];
}

const ranges = ["day", "week", "month"] as const;
type Range = (typeof ranges)[number];

export default function DashboardPage() {
  const { toasts, toast } = useToast();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [income, setIncome] = useState<IncomeData | null>(null);
  const [range, setRange] = useState<Range>("day");
  const [loading, setLoading] = useState(false);

  // ✅ SAFE MOBILE STATE (NO SSR CRASH)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 768px)");

    const update = () => setIsMobile(media.matches);

    update();

    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        const [ov, inc] = await Promise.all([getOverview(), getIncome(range)]);

        if (!isMounted) return;

        setOverview(ov.data);
        setIncome(inc.data);
      } catch {
        if (isMounted) {
          toast("Failed to load analytics", "error");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [range, toast]);

  const chartData =
    income?.labels.map((label, i) => ({
      label,
      amount: income.totals[i],
    })) || [];

  const stats = [
    {
      label: "Total Users",
      value: overview?.users ?? "—",
      icon: Users,
      color: "var(--accent)",
    },
    {
      label: "Transactions",
      value: overview?.transactions ?? "—",
      icon: ArrowLeftRight,
      color: "var(--info)",
    },
    {
      label: "Total Revenue",
      value: overview ? fmt(overview.revenue) : "—",
      icon: TrendingUp,
      color: "var(--success)",
    },
    {
      label: "Avg. Revenue",
      value: overview
        ? fmt(overview.revenue / (Number(overview.transactions) || 1))
        : "—",
      icon: CreditCard,
      color: "var(--warning)",
    },
  ];

  const tooltipFormatter = (value: unknown): [string, string] => {
    const num = typeof value === "number" ? value : Number(value ?? 0);
    return [fmt(Number.isNaN(num) ? 0 : num), "Revenue"];
  };

  return (
    <AdminShell title="Dashboard">
      <ToastContainer toasts={toasts} />

      {loading ? (
        <div style={{ display: "flex", gap: 10, paddingTop: 40 }}>
          <span className="spin" /> Loading analytics…
        </div>
      ) : (
        <>
          {/* STATS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(auto-fit, minmax(180px, 1fr))",
              gap: isMobile ? 10 : 14,
              marginBottom: isMobile ? 18 : 28,
            }}
          >
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div className="stat-label">{s.label}</div>
                  <s.icon size={18} color={s.color} />
                </div>

                <div className="stat-value" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* CHART */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: isMobile ? 14 : "20px 24px",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div className="section-title">Income Overview</div>

              <div style={{ display: "flex", gap: 6 }}>
                {ranges.map((r) => (
                  <button
                    key={r}
                    className="price-tab"
                    onClick={() => setRange(r)}
                    style={{
                      flex: isMobile ? 1 : undefined,
                      padding: isMobile ? "8px 10px" : "5px 14px",
                    }}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* GRAPH */}
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={isMobile ? 320 : 260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#f97316"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--text3)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fill: "var(--text3)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => "₦" + Number(v).toLocaleString()}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                    formatter={tooltipFormatter}
                  />

                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No income data for this period</div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}
