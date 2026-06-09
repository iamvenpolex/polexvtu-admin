"use client";

import { useEffect, useState } from "react";
import { Plan, calcFinal } from "@/hooks/useSmartPricing";
import { fmt } from "@/lib/utils";

interface Props {
  plans: Plan[];
  globalMarkup: number;
  onSetFixed: (planId: string, val: string) => void;
  onSetMarkup: (planId: string, val: string) => void;
  loading?: boolean;
}

export function SmartPricingTable({
  plans,
  globalMarkup,
  onSetFixed,
  onSetMarkup,
  loading,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <span className="spin" />
      </div>
    );
  }

  if (!plans.length) return <div className="empty-state">No plans found</div>;

  const getRuleData = (p: Plan) => {
    const rule =
      p.fixed_price != null
        ? "fixed"
        : p.markup != null
          ? "markup"
          : globalMarkup > 0
            ? "global"
            : "none";

    return {
      fixed: { label: "Fixed", badge: "badge-warn" },
      markup: { label: "Markup", badge: "badge-info" },
      global: { label: "Global", badge: "badge-orange" },
      none: { label: "Raw", badge: "badge-gray" },
    }[rule];
  };

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {plans.map((p) => {
          const base = p.ea_price ?? p.price ?? 0;
          const final = calcFinal(p, globalMarkup);
          const profit = final - base;
          const rule = getRuleData(p);

          return (
            <div
              key={p.plan_id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 12 }}>{p.name}</div>

              <div>Provider: {fmt(base)}</div>
              <div style={{ color: "var(--accent)" }}>Final: {fmt(final)}</div>
              <div>Profit: {fmt(profit)}</div>

              <div>
                Rule:{" "}
                <span className={`badge ${rule.badge}`}>{rule.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Provider</th>
            <th>Fixed</th>
            <th>Markup</th>
            <th>Final</th>
            <th>Profit</th>
            <th>Rule</th>
          </tr>
        </thead>

        <tbody>
          {plans.map((p) => {
            const base = p.ea_price ?? p.price ?? 0;
            const final = calcFinal(p, globalMarkup);
            const profit = final - base;
            const rule = getRuleData(p);

            return (
              <tr key={p.plan_id}>
                <td>{p.name}</td>
                <td>{fmt(base)}</td>

                <td>
                  <input
                    value={p.fixed_price ?? ""}
                    onChange={(e) => onSetFixed(p.plan_id, e.target.value)}
                  />
                </td>

                <td>
                  <input
                    value={p.markup ?? ""}
                    onChange={(e) => onSetMarkup(p.plan_id, e.target.value)}
                  />
                </td>

                <td style={{ color: "var(--accent)" }}>{fmt(final)}</td>

                <td>{fmt(profit)}</td>

                <td>
                  <span className={`badge ${rule.badge}`}>{rule.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
