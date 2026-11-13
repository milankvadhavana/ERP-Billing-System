import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
<<<<<<< HEAD
import { FileText, Package, BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import API from "./api";
import BrandLogo from "./BrandLogo";
import { colors, GlobalStyles } from "./theme";

const features = [
  { icon: FileText, text: "Create invoices and download PDFs" },
  { icon: Package, text: "Track stock and prevent overselling" },
  { icon: BookOpen, text: "Follow every customer's balance due" },
];
=======
import API from "./api";
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    }
    setLoading(false);
=======
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/login", form);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
  };

  return (
    <div style={styles.container}>
<<<<<<< HEAD
      <GlobalStyles />

      {/* LEFT - BRANDING */}
      <div className="sj-auth-left" style={styles.leftPanel}>
        <div style={styles.glow} />
        <div style={styles.leftInner}>
          <BrandLogo maxWidth={380} radius={16} shadow="0 20px 40px rgba(0,0,0,.35)" />

          <h1 style={styles.tagline}>
            Billing, Stock &amp; Customer Ledger,{" "}
            <span style={{ color: colors.orange }}>all in one place.</span>
          </h1>

          <ul style={styles.featureList}>
            {features.map(({ icon: Icon, text }) => (
              <li key={text} style={styles.featureItem}>
                <span style={styles.featureIcon}><Icon size={18} color={colors.orange} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p style={styles.footerText}>© 2026 Shreeji Orange Decore. All rights reserved.</p>
      </div>

      {/* RIGHT - FORM */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your billing account</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrap}>
                <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  className="sj-input"
                  placeholder="admin@shreeji.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type={showPwd ? "text" : "password"}
                  className="sj-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ ...styles.input, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={styles.eyeBtn} aria-label="Toggle password">
                  {showPwd ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="sj-btn-primary" style={styles.button}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={styles.footerTextRight}>
            Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
          </p>
        </div>
      </div>
=======
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={styles.input} />
        <button type="submit" style={styles.button}>Login</button>
        <p>No account? <Link to="/register">Register</Link></p>
      </form>
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
    </div>
  );
}

const styles = {
<<<<<<< HEAD
  container: { display: "flex", minHeight: "100vh", width: "100%" },

  leftPanel: { flex: 1.05, background: "linear-gradient(145deg, #0b1220 0%, #1c1210 55%, #431407 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 56px", position: "relative", overflow: "hidden" },
  glow: { position: "absolute", width: 520, height: 520, right: -160, bottom: -160, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,.35), transparent 65%)" },
  leftInner: { position: "relative", margin: "auto 0", display: "flex", flexDirection: "column", gap: 36 },
  tagline: { fontSize: 38, color: "#fff", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.5px", maxWidth: 520 },
  featureList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 },
  featureItem: { display: "flex", alignItems: "center", gap: 14, color: "#cbd5e1", fontSize: 15.5 },
  featureIcon: { width: 38, height: 38, borderRadius: 10, background: "rgba(249,115,22,.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  footerText: { position: "relative", color: "#64748b", fontSize: 13 },

  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: 24 },
  formContainer: { width: "100%", maxWidth: 400 },
  title: { fontSize: 32, fontWeight: 800, color: colors.ink, letterSpacing: "-0.5px", marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: 32 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13.5, fontWeight: 600, color: colors.text },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: 14, pointerEvents: "none" },
  input: { width: "100%", padding: "13px 14px 13px 44px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 15, outline: "none", background: "#f8fafc", fontFamily: "inherit", color: colors.ink },
  eyeBtn: { position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex" },
  button: { padding: 14, background: colors.orange, color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 6, fontFamily: "inherit" },
  errorBox: { padding: "12px 14px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 20, fontSize: 14 },
  footerTextRight: { textAlign: "center", marginTop: 28, fontSize: 14, color: colors.muted },
  link: { color: colors.orange, textDecoration: "none", fontWeight: 700 },
};
=======
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" },
  card: { background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "320px", display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid #ccc" },
  button: { padding: "10px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red" },
};
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
