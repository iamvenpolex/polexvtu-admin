"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    import("js-cookie").then((Cookies) => {
      if (!Cookies.default.get("tapam_admin_token")) {
        router.push("/login");
      }
    });
  }, [router]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* SIDEBAR CONTROLLED HERE */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* TOPBAR */}
        <div
          style={{
            height: 56,
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          {/* ☰ BUTTON */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Menu size={22} />
          </button>

          <div
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
            }}
          >
            {title}
          </div>

          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
