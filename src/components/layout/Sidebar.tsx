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

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav
      style={{
        width: 240,
        minWidth: 240,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 18px 16px",
          fontFamily: "Syne, sans-serif",
          fontSize: 22,
          fontWeight: 800,
          color: "var(--accent)",
          letterSpacing: "-0.5px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        ⬡ Tapam
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: "var(--text3)",
            fontFamily: "DM Sans, sans-serif",
            letterSpacing: 0,
          }}
        >
          Admin
        </span>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, paddingTop: 8 }}>
        {navItems.map((item, i) => {
          if ("section" in item) {
            return (
              <div
                key={i}
                style={{
                  padding: "16px 18px 4px",
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
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? " active" : ""}`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
        <div
          style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg,var(--accent),#ec4899)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              color: "#fff",
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Admin</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>
              admin@tapam.com.ng
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn-ghost"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </nav>
  );
}
