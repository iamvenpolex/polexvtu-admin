"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminLogin } from "@/lib/services";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@tapam.com.ng");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      login(res.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      setError(msg || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Subtle grid bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 400,
          position: "relative",
        }}
      >
        {/* Accent top line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 24,
            right: 24,
            height: 2,
            background: "linear-gradient(90deg, var(--accent), transparent)",
            borderRadius: "0 0 4px 4px",
          }}
        />

        <div
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 30,
            fontWeight: 800,
            color: "var(--accent)",
            marginBottom: 4,
          }}
        >
          ⬡ Tapam
        </div>
        <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 32 }}>
          Admin Control Panel — Sign in to continue
        </div>

        {error && (
          <div
            style={{
              background: "#ef444420",
              border: "1px solid #ef444440",
              color: "#f87171",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <label className="form-label">Email address</label>
        <input
          className="form-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 16 }}
          placeholder="admin@tapam.com.ng"
        />

        <label className="form-label">Password</label>
        <input
          className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 20 }}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button
          className="btn-primary"
          style={{ width: "100%", padding: 12, fontSize: 15 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spin" style={{ marginRight: 8 }} />
              Signing in…
            </>
          ) : (
            "Sign in →"
          )}
        </button>
      </div>
    </div>
  );
}
