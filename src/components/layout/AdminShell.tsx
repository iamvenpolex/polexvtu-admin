"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();

  useEffect(() => {
    import("js-cookie").then((Cookies) => {
      if (!Cookies.default.get("tapam_admin_token")) router.push("/login");
    });
  }, [router]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Topbar */}
        <div
          style={{
            height: 56,
            minHeight: 56,
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 17,
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
        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
