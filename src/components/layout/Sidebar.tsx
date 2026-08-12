"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Gift,
  Tv,
  Wifi,
  GraduationCap,
  MessageSquare,
  LogOut,
  X,
  Wallet,
  RotateCcw,
  Bell,
} from "lucide-react";

const navItems = [
  { section: "Overview" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  { section: "Management" },
  { href: "/users", label: "Users", icon: Users },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/gift-cards", label: "Gift Cards", icon: Gift },
  { href: "/wallet-funding", label: "Fund / Refund", icon: Wallet },
  { href: "/notifications", label: "Notifications", icon: Bell },

  { section: "Pricing" },
  { href: "/pricing/cabletv", label: "Cable TV Prices", icon: Tv },
  { href: "/pricing/data", label: "Data Prices", icon: Wifi },
  { href: "/education", label: "Education Prices", icon: GraduationCap },
  { href: "/pricing/sms", label: "SMS Pricing", icon: MessageSquare },
];

export function Sidebar({
  open,
  setOpen,
  isMobile,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  isMobile: boolean;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const close = () => setOpen(false);

  return (
    <>
      {/* OVERLAY (MOBILE ONLY) */}
      {isMobile && open && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 999,
          }}
        />
      )}

      <nav
        style={{
          width: 240,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "fixed",
          left: isMobile ? (open ? 0 : -240) : 0,
          top: 0,
          zIndex: 1000,
          transition: "left .3s ease",
          overflowY: "auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "18px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--border)",
            fontFamily: "Syne",
            fontWeight: 800,
            fontSize: 20,
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          ⬡ Tapam
          <span
            style={{
              marginLeft: 6,
              fontSize: 12,
              color: "var(--text3)",
              fontWeight: 400,
            }}
          >
            Admin
          </span>
          {isMobile && (
            <button
              onClick={close}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text2)",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* NAV */}
        <div style={{ flex: 1, paddingTop: 8 }}>
          {navItems.map((item, i) => {
            if ("section" in item) {
              return (
                <div
                  key={i}
                  style={{
                    padding: "14px 18px 4px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                  }}
                >
                  {item.section}
                </div>
              );
            }

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  margin: "1px 6px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 14,
                  color: active ? "var(--accent)" : "var(--text2)",
                  background: active
                    ? "linear-gradient(135deg,#f9731618,#fb923c0a)"
                    : "transparent",
                  border: active
                    ? "1px solid #f9731625"
                    : "1px solid transparent",
                  fontWeight: active ? 500 : 400,
                  transition: "all .15s",
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "9px 16px",
              border: "1px solid var(--border2)",
              borderRadius: 8,
              cursor: "pointer",
              background: "none",
              color: "var(--text2)",
              fontSize: 13,
              transition: "all .2s",
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
}
