"use client";
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
  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <span className="spin" />
      </div>
    );
  if (!plans.length) return <div className="empty-state">No plans found</div>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Plan Name</th>
            <th>Provider Price</th>
            <th title="Set an exact price — ignores provider changes">
              Fixed Override ①
            </th>
            <th title="Added on top of provider price automatically">
              Auto-Markup ②
            </th>
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

            return (
              <tr key={p.plan_id}>
                <td style={{ fontWeight: 500, minWidth: 180 }}>{p.name}</td>
                <td className="mono" style={{ color: "var(--text2)" }}>
                  {fmt(base)}
                </td>
                <td>
                  <input
                    type="number"
                    className="rule-input"
                    placeholder="e.g. 106"
                    min="0"
                    style={{ width: 100 }}
                    value={p.fixed_price ?? ""}
                    onChange={(e) => onSetFixed(p.plan_id, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="rule-input"
                    placeholder="e.g. 5"
                    min="0"
                    style={{ width: 90 }}
                    value={p.markup ?? ""}
                    onChange={(e) => onSetMarkup(p.plan_id, e.target.value)}
                  />
                </td>
                <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                  {fmt(final)}
                </td>
                <td
                  style={{
                    fontSize: 12,
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
                  <span className={`badge ${ruleBadge[rule]}`}>
                    {ruleLabels[rule]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
