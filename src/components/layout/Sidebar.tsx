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
} from "lucide-react";

const navItems = [
  { section: "Overview" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  { section: "Management" },
  { href: "/users", label: "Users", icon: Users },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/gift-cards", label: "Gift Cards", icon: Gift },

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

          position: isMobile ? "fixed" : "fixed",
          left: isMobile ? (open ? 0 : -240) : 0,
          top: 0,

          zIndex: 1000,
          transition: "left .3s ease",
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
          }}
        >
          ⬡ Tapam
          <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text3)" }}>
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
                <div key={i} style={{ padding: "14px 18px 4px", fontSize: 10 }}>
                  {item.section}
                </div>
              );
            }

            const active =
              pathname === item.href || pathname.startsWith(item.href);

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
                  padding: "10px 18px",
                  textDecoration: "none",
                  color: active ? "var(--accent)" : "var(--text)",
                  background: active ? "rgba(0,0,0,0.05)" : "transparent",
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}
        <div style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: 8,
              padding: 10,
              border: "none",
              cursor: "pointer",
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
