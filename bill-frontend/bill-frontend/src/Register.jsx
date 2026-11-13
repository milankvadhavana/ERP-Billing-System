import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
<<<<<<< HEAD
import { FileText, Package, BookOpen } from "lucide-react";
import API from "./api";
import BrandLogo from "./BrandLogo";
import { colors, GlobalStyles } from "./theme";

const features = [
  { icon: FileText, text: "Create invoices and download PDFs" },
  { icon: Package, text: "Track stock and prevent overselling" },
  { icon: BookOpen, text: "Follow every customer's balance due" },
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", businessName: "" });
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
    setLoading(false);
=======
import API from "./api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    try {
      const res = await API.post("/register", form);
      setMsg(res.data.message + " — redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.subtitle}>Set up your business billing account</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="sj-row2" style={styles.row}>
              <Field label="Full name">
                <input className="sj-input" type="text" value={form.name} onChange={set("name")} required style={styles.input} />
              </Field>
              <Field label="Phone">
                <input className="sj-input" type="tel" value={form.phone} onChange={set("phone")} required style={styles.input} />
              </Field>
            </div>

            <Field label="Business name">
              <input className="sj-input" type="text" placeholder="Shreeji Orange Decore" value={form.businessName} onChange={set("businessName")} style={styles.input} />
            </Field>

            <Field label="Email">
              <input className="sj-input" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} required style={styles.input} />
            </Field>

            <div className="sj-row2" style={styles.row}>
              <Field label="Password">
                <input className="sj-input" type="password" value={form.password} onChange={set("password")} required minLength={6} style={styles.input} />
              </Field>
              <Field label="Confirm password">
                <input className="sj-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={styles.input} />
              </Field>
            </div>

            <button type="submit" disabled={loading} className="sj-btn-primary" style={styles.button}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p style={styles.footerTextRight}>
            Already registered? <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label}</label>
      {children}
=======
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        {msg && <p style={styles.success}>{msg}</p>}
        <input name="name" placeholder="Name" onChange={handleChange} required style={styles.input} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={styles.input} />
        <input name="phone" placeholder="Phone" onChange={handleChange} style={styles.input} />
        <button type="submit" style={styles.button}>Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
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
  formContainer: { width: "100%", maxWidth: 480 },
  title: { fontSize: 32, fontWeight: 800, color: colors.ink, letterSpacing: "-0.5px", marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: 28 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  row: { display: "flex", gap: 14 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  label: { fontSize: 13.5, fontWeight: 600, color: colors.text },
  input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 15, outline: "none", background: "#f8fafc", fontFamily: "inherit", color: colors.ink },
  button: { padding: 14, background: colors.orange, color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 6, fontFamily: "inherit" },
  errorBox: { padding: "12px 14px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 20, fontSize: 14 },
  footerTextRight: { textAlign: "center", marginTop: 26, fontSize: 14, color: colors.muted },
  link: { color: colors.orange, textDecoration: "none", fontWeight: 700 },
};
=======
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" },
  card: { background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "320px", display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid #ccc" },
  button: { padding: "10px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red" },
  success: { color: "green" },
};
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
