"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    import("js-cookie").then((Cookies) => {
      if (!Cookies.default.get("tapam_admin_token")) {
        router.push("/login");
      }
    });
  }, [router]);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          marginLeft: isMobile ? 0 : 0,
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
            padding: isMobile ? "0 16px 0 70px" : "0 24px",
          }}
        >
          <div
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--text3)",
              display: isMobile ? "none" : "block",
            }}
          >
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "16px" : "28px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
