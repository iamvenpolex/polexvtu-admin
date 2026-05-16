"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token === null) {
      // Give auth context time to hydrate from cookie
      const t = setTimeout(() => {
        import("js-cookie").then((Cookies) => {
          if (!Cookies.default.get("tapam_admin_token")) router.push("/login");
        });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [token, router]);

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
        {children}
      </div>
    </div>
  );
}
