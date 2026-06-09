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
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <span className="spin" />
      </div>
    );
  }

  if (!plans.length) {
    return <div className="empty-state">No plans found</div>;
  }

  const getRuleData = (p: Plan) => {
    const rule =
      p.fixed_price != null
        ? "fixed"
        : p.markup != null
          ? "markup"
          : globalMarkup > 0
            ? "global"
            : "none";

    const ruleLabels: Record<string, string> = {
      fixed: "Fixed",
      markup: "Markup",
      global: "Global",
      none: "Raw",
    };

    const ruleBadge: Record<string, string> = {
      fixed: "badge-warn",
      markup: "badge-info",
      global: "badge-orange",
      none: "badge-gray",
    };

    return {
      label: ruleLabels[rule],
      badge: ruleBadge[rule],
    };
  };

  /* ---------------- MOBILE CARDS ---------------- */

  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
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
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                {p.name}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <div>
                  <strong>Provider Price:</strong> {fmt(base)}
                </div>

                <div>
                  <strong>Final Price:</strong>{" "}
                  <span style={{ color: "var(--accent)" }}>{fmt(final)}</span>
                </div>

                <div>
                  <strong>Profit:</strong>{" "}
                  <span
                    style={{
                      color:
                        profit > 0
                          ? "var(--success)"
                          : profit < 0
                            ? "var(--danger)"
                            : "var(--text3)",
                    }}
                  >
                    {profit > 0 ? "+" : ""}
                    {fmt(profit)}
                  </span>
                </div>

                <div>
                  <strong>Rule:</strong>{" "}
                  <span className={`badge ${rule.badge}`}>{rule.label}</span>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Fixed Override
                  </label>

                  <input
                    type="number"
                    className="rule-input"
                    placeholder="e.g. 106"
                    min="0"
                    value={p.fixed_price ?? ""}
                    onChange={(e) => onSetFixed(p.plan_id, e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    Auto Markup
                  </label>

                  <input
                    type="number"
                    className="rule-input"
                    placeholder="e.g. 5"
                    min="0"
                    value={p.markup ?? ""}
                    onChange={(e) => onSetMarkup(p.plan_id, e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ---------------- DESKTOP TABLE ---------------- */

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Plan Name</th>
            <th>Provider Price</th>
            <th>Fixed Override</th>
            <th>Auto-Markup</th>
            <th>Final Price</th>
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
                <td style={{ fontWeight: 500 }}>{p.name}</td>

                <td className="mono">{fmt(base)}</td>

                <td>
                  <input
                    type="number"
                    className="rule-input"
                    min="0"
                    value={p.fixed_price ?? ""}
                    onChange={(e) => onSetFixed(p.plan_id, e.target.value)}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="rule-input"
                    min="0"
                    value={p.markup ?? ""}
                    onChange={(e) => onSetMarkup(p.plan_id, e.target.value)}
                  />
                </td>

                <td
                  style={{
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}
                >
                  {fmt(final)}
                </td>

                <td
                  style={{
                    color:
                      profit > 0
                        ? "var(--success)"
                        : profit < 0
                          ? "var(--danger)"
                          : "var(--text3)",
                  }}
                >
                  {profit > 0 ? "+" : ""}
                  {fmt(profit)}
                </td>

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
