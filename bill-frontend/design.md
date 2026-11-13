layout.jsx

import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Package, Users, FileText, 
  CreditCard, BookOpen, Settings, LogOut, 
  ChevronDown, Bell
} from "lucide-react";

// 1. IMPORT YOUR LOGO HERE
import logoImage from "./assets/logo.jpeg"; 

export default function Layout({ children, title, headerColor = "#f97316" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Products", path: "/products", icon: <Package size={20} /> },
    { name: "Customers", path: "/customers", icon: <Users size={20} /> },
    { name: "Invoices", path: "/invoices", icon: <FileText size={20} /> },
    { name: "Payments", path: "/payments", icon: <CreditCard size={20} /> },
    { name: "Ledger", path: "/ledger", icon: <BookOpen size={20} /> },
  ];

  return (
    <div style={styles.appContainer}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        
        {/* Logo Area */}
        <div style={styles.brandContainer}>
          {/* 2. USE THE IMPORTED VARIABLE HERE */}
          <img 
            src={logoImage} 
            alt="Shreeji Logo" 
            style={{ width: "160px", objectFit: "contain" }} 
          />
        </div>

        {/* Navigation Links */}
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={isActive ? styles.navItemActive : styles.navItem}
              >
                <span style={{ marginRight: "12px", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div style={styles.bottomSection}>
          <Link to="/settings" style={styles.navItem}>
            <span style={{ marginRight: "12px", display: "flex", alignItems: "center" }}>
              <Settings size={20} />
            </span>
            Settings
          </Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <span style={{ marginRight: "12px", display: "flex", alignItems: "center" }}>
              <LogOut size={20} />
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainWrapper}>
        {/* TOP HEADER */}
        <header style={{...styles.header, backgroundColor: headerColor}}>
          <h2 style={styles.headerTitle}>{title}</h2>
          
          <div style={styles.headerRight}>
            <button style={styles.iconBtn}>
              <Bell size={20} color="#fff" />
            </button>
            <div style={styles.userProfile}>
              <div style={styles.avatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <span style={styles.userName}>{user?.name || "Admin"}</span>
              <ChevronDown size={16} color="#fff" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  appContainer: { display: "flex", minHeight: "100vh", width: "100vw", background: "#f8fafc" },
  sidebar: { width: "260px", background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0 },
  brandContainer: { height: "90px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderBottom: "1px solid #e2e8f0" },
  nav: { display: "flex", flexDirection: "column", padding: "20px 15px", gap: "5px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", padding: "12px 20px", color: "#94a3b8", textDecoration: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", transition: "all 0.2s" },
  navItemActive: { display: "flex", alignItems: "center", padding: "12px 20px", color: "#fff", textDecoration: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", background: "#f97316" },
  bottomSection: { padding: "20px 15px", borderTop: "1px solid #1e293b" },
  logoutBtn: { display: "flex", alignItems: "center", background: "transparent", color: "#f87171", border: "none", padding: "12px 20px", width: "100%", fontSize: "15px", fontWeight: "500", cursor: "pointer", textAlign: "left" },
  
  mainWrapper: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  header: { height: "90px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", color: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  headerTitle: { fontSize: "28px", fontWeight: "700", letterSpacing: "0.5px" },
  headerRight: { display: "flex", alignItems: "center", gap: "25px" },
  iconBtn: { background: "rgba(255,255,255,0.1)", border: "none", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  userProfile: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" },
  avatar: { background: "#fff", color: "#0f172a", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontWeight: "700", fontSize: "18px" },
  userName: { fontSize: "16px", fontWeight: "600" },
  content: { padding: "40px", flex: 1 },
};




login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "./api";
import Logo from "./Logo";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE - BRANDING */}
      <div style={styles.leftPanel}>
        <div style={styles.logoWrapper}>
          <Logo darkTheme={true} />
        </div>
        <div style={styles.taglineContainer}>
          <h1 style={styles.tagline}>Billing, Stock & Customer Ledger — <span style={{ color: '#f97316' }}>in one place.</span></h1>
          <ul style={styles.featureList}>
            <li>📄 Create invoices and download PDFs</li>
            <li>📦 Track stock and prevent overselling</li>
            <li>📖 Follow every customer's balance due</li>
          </ul>
        </div>
        <p style={styles.footerText}>© 2026 Shreeji Orange Decore. All rights reserved.</p>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your billing account</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input 
                type="email" 
                placeholder="admin@shreeji.com" 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
                style={styles.input} 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                required 
                style={styles.input} 
              />
            </div>
            <button type="submit" style={styles.button}>Sign in</button>
          </form>

          <p style={styles.footerTextRight}>
            Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", width: "100vw" },
  leftPanel: { 
    flex: 1, 
    background: "linear-gradient(135deg, #111827 0%, #431407 100%)", // Dark gradient matching your image
    display: "flex", 
    flexDirection: "column", 
    padding: "40px",
    position: "relative"
  },
  logoWrapper: {
    display: "inline-block",
    background: "#fff",
    padding: "20px 40px",
    borderRadius: "12px",
    alignSelf: "flex-start",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
  },
  taglineContainer: { margin: "auto 0", maxWidth: "500px" },
  tagline: { fontSize: "36px", color: "#fff", fontWeight: "800", lineHeight: "1.2", marginBottom: "30px" },
  featureList: { listStyle: "none", padding: 0, color: "#cbd5e1", fontSize: "16px", display: "flex", flexDirection: "column", gap: "15px" },
  footerText: { color: "#64748b", fontSize: "13px" },
  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" },
  formContainer: { width: "100%", maxWidth: "420px", padding: "40px" },
  title: { fontSize: "32px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" },
  subtitle: { fontSize: "15px", color: "#64748b", marginBottom: "30px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#334155" },
  input: { padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none", transition: "border 0.2s" },
  button: { padding: "14px", background: "#f97316", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer", marginTop: "10px", transition: "background 0.2s" },
  errorBox: { padding: "12px", background: "#fee2e2", color: "#dc2626", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  footerTextRight: { textAlign: "center", marginTop: "30px", fontSize: "14px", color: "#64748b" },
  link: { color: "#f97316", textDecoration: "none", fontWeight: "700" }
};

register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "./api";
import Logo from "./Logo";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", businessName: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // In a real app, you'd send businessName too, but we'll stick to your backend model for now
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE - BRANDING */}
      <div style={styles.leftPanel}>
        <div style={styles.logoWrapper}>
          <Logo darkTheme={true} />
        </div>
        <div style={styles.taglineContainer}>
          <h1 style={styles.tagline}>Billing, Stock & Customer Ledger — <span style={{ color: '#f97316' }}>in one place.</span></h1>
          <ul style={styles.featureList}>
            <li>📄 Create invoices and download PDFs</li>
            <li>📦 Track stock and prevent overselling</li>
            <li>📖 Follow every customer's balance due</li>
          </ul>
        </div>
        <p style={styles.footerText}>© 2026 Shreeji Orange Decore. All rights reserved.</p>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.subtitle}>Set up your business billing account</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full name</label>
                <input type="text" onChange={(e) => setForm({ ...form, name: e.target.value })} required style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone</label>
                <input type="text" onChange={(e) => setForm({ ...form, phone: e.target.value })} required style={styles.input} />
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Business name</label>
              <input type="text" placeholder="Shreeji Orange Decore" onChange={(e) => setForm({ ...form, businessName: e.target.value })} style={styles.input} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} required style={styles.input} />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} required style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm</label>
                <input type="password" required style={styles.input} />
              </div>
            </div>
            
            <button type="submit" style={styles.button}>Create account</button>
          </form>

          <p style={styles.footerTextRight}>
            Already registered? <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", width: "100vw" },
  leftPanel: { 
    flex: 1, 
    background: "linear-gradient(135deg, #111827 0%, #431407 100%)", 
    display: "flex", flexDirection: "column", padding: "40px", position: "relative" 
  },
  logoWrapper: { display: "inline-block", background: "#fff", padding: "20px 40px", borderRadius: "12px", alignSelf: "flex-start", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" },
  taglineContainer: { margin: "auto 0", maxWidth: "500px" },
  tagline: { fontSize: "36px", color: "#fff", fontWeight: "800", lineHeight: "1.2", marginBottom: "30px" },
  featureList: { listStyle: "none", padding: 0, color: "#cbd5e1", fontSize: "16px", display: "flex", flexDirection: "column", gap: "15px" },
  footerText: { color: "#64748b", fontSize: "13px" },
  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" },
  formContainer: { width: "100%", maxWidth: "500px", padding: "40px" },
  title: { fontSize: "32px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" },
  subtitle: { fontSize: "15px", color: "#64748b", marginBottom: "30px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "flex", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  label: { fontSize: "14px", fontWeight: "600", color: "#334155" },
  input: { padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", outline: "none" },
  button: { padding: "14px", background: "#f97316", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer", marginTop: "10px" },
  errorBox: { padding: "12px", background: "#fee2e2", color: "#dc2626", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  footerTextRight: { textAlign: "center", marginTop: "30px", fontSize: "14px", color: "#64748b" },
  link: { color: "#f97316", textDecoration: "none", fontWeight: "700" }
};

dashboard.jsx
import Layout from "./Layout";

export default function Dashboard() {
  return (
    <Layout title="Dashboard" headerColor="#ea580c">
      {/* STATS CARDS */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, background: "#e0f2fe", color: "#0284c7"}}>
          <div style={styles.statHeader}><span>Total Sales</span> <span>₹</span></div>
          <h3 style={styles.statValue}>₹1,09,000.00</h3>
        </div>
        <div style={{...styles.statCard, background: "#dcfce7", color: "#16a34a"}}>
          <div style={styles.statHeader}><span>Received</span> <span>₹</span></div>
          <h3 style={styles.statValue}>₹76,000.00</h3>
        </div>
        <div style={{...styles.statCard, background: "#fee2e2", color: "#dc2626"}}>
          <div style={styles.statHeader}><span>Outstanding</span> <span>!</span></div>
          <h3 style={styles.statValue}>₹33,000.00</h3>
        </div>
        <div style={{...styles.statCard, background: "#ffedd5", color: "#c2410c"}}>
          <div style={styles.statHeader}><span>Products</span> <span>📦</span></div>
          <h3 style={styles.statValue}>6</h3>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={styles.actionsRow}>
        <button style={styles.primaryAction}>+ New Invoice</button>
        <button style={styles.secondaryAction}>📦 Manage Stock</button>
        <button style={styles.secondaryAction}>📖 View Ledger</button>
      </div>

      {/* CONTENT GRID */}
      <div style={styles.contentGrid}>
        {/* RECENT INVOICES */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Recent Invoices</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>INVOICE</th>
                <th style={styles.th}>CUSTOMER</th>
                <th style={styles.th}>DATE</th>
                <th style={styles.th}>TOTAL</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{...styles.td, color: "#0284c7", fontWeight: "600"}}>INV-0012</td>
                <td style={styles.td}>Sunil Enterprises</td>
                <td style={styles.td}>30-10-2026</td>
                <td style={styles.td}>₹7,800.00</td>
                <td style={styles.td}><span style={styles.badgeWarning}>Partially Paid</span></td>
              </tr>
              <tr>
                <td style={{...styles.td, color: "#0284c7", fontWeight: "600"}}>INV-0011</td>
                <td style={styles.td}>Rahul Traders</td>
                <td style={styles.td}>29-10-2026</td>
                <td style={styles.td}>₹12,500.00</td>
                <td style={styles.td}><span style={styles.badgeSuccess}>Paid</span></td>
              </tr>
              <tr>
                <td style={{...styles.td, color: "#0284c7", fontWeight: "600"}}>INV-0010</td>
                <td style={styles.td}>Neha Stores</td>
                <td style={styles.td}>27-10-2026</td>
                <td style={styles.td}>₹4,200.00</td>
                <td style={styles.td}><span style={styles.badgeDanger}>Unpaid</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* RIGHT SIDE ALERTS */}
        <div style={styles.rightColumn}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Stock Alerts</h3>
            <div style={styles.alertRow}>
              <span>USB Cable (5 left)</span>
              <span style={styles.badgeWarning}>Low Stock</span>
            </div>
            <div style={styles.alertRow}>
              <span>Laptop Bag (0 left)</span>
              <span style={styles.badgeDanger}>Out of Stock</span>
            </div>
          </div>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Top Outstanding</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px'}}>
              <span>Sunil Enterprises</span>
              <span style={{color: '#dc2626', fontWeight: '600'}}>₹18,000.00</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px'}}>
              <span>Neha Stores</span>
              <span style={{color: '#dc2626', fontWeight: '600'}}>₹10,000.00</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px'}}>
              <span>Amit Sharma</span>
              <span style={{color: '#dc2626', fontWeight: '600'}}>₹5,000.00</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" },
  statCard: { padding: "24px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "15px" },
  statHeader: { display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", opacity: 0.8 },
  statValue: { fontSize: "28px", fontWeight: "800" },
  actionsRow: { display: "flex", gap: "15px", marginBottom: "30px" },
  primaryAction: { background: "#ea580c", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  secondaryAction: { background: "#fff", color: "#1e293b", border: "1px solid #cbd5e1", padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  contentGrid: { display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" },
  card: { background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  cardTitle: { fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "#0f172a" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 0", borderBottom: "2px solid #e2e8f0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" },
  td: { padding: "16px 0", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" },
  badgeWarning: { background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  badgeSuccess: { background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  badgeDanger: { background: "#fee2e2", color: "#b91c1c", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  rightColumn: { display: "flex", flexDirection: "column", gap: "30px" },
  alertRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9", fontSize: "14px" }
};

customer.jsx
import { useEffect, useState, useRef } from "react";
import Layout from "./Layout";
import API from "./api";
import { 
  Plus, 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  MoreVertical,
  X
} from "lucide-react";

export default function Customers() {
  const fileInputRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({ organizationName: "", mobileNumber: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customers/all");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers", err);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await API.post("/customers/add", newCustomer);
      setMessage({ type: "success", text: "Customer added successfully!" });
      setNewCustomer({ organizationName: "", mobileNumber: "" });
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to add customer." });
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await API.post("/customers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage({ type: "success", text: "Bulk upload successful!" });
      fetchCustomers();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Upload failed." });
    }
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const filteredCustomers = customers.filter(c => 
    c.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobileNumber.includes(searchTerm)
  );

  return (
    <Layout title="Customer Management" headerColor="#15803d">
      
      {message.text && (
        <div style={message.type === "success" ? styles.successBox : styles.errorBox}>
          {message.text}
        </div>
      )}

      {/* MAIN WHITE CARD */}
      <div style={styles.mainCard}>
        
        {/* Top Bar: Search and Action Buttons */}
        <div style={styles.topBar}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "12px" }} />
            <input 
              type="text" 
              placeholder="Search customer by name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.actionGroup}>
            <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} style={{ display: 'none' }} id="csv-upload" />
            <label htmlFor="csv-upload" style={styles.secondaryBtn}>
              <Upload size={16} /> Bulk Upload
            </label>
            
            <button onClick={() => setIsModalOpen(true)} style={styles.primaryBtn}>
              <Plus size={18} /> Add Customer
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: "50px"}}>#</th>
                <th style={styles.th}>Organization Name</th>
                <th style={styles.th}>Mobile Number</th>
                <th style={styles.th}>Status</th>
                <th style={{...styles.th, textAlign: "right"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, index) => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={{...styles.td, fontWeight: "600", color: "#1e293b"}}>{c.organizationName}</td>
                    <td style={styles.td}>{c.mobileNumber}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge}>Active</span>
                    </td>
                    <td style={{...styles.td, textAlign: "right"}}>
                      <button style={styles.actionIcon}><Edit size={16} color="#3b82f6" /></button>
                      <button style={styles.actionIcon}><Trash2 size={16} color="#ef4444" /></button>
                      <button style={styles.actionIcon}><MoreVertical size={16} color="#64748b" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={styles.tableFooter}>
          Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customers
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{margin: 0, fontSize: '20px', color: '#1e293b'}}>Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddCustomer} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Organization Name</label>
                <input 
                  value={newCustomer.organizationName} 
                  onChange={(e) => setNewCustomer({...newCustomer, organizationName: e.target.value})} 
                  required 
                  style={styles.input} 
                  placeholder="e.g. Acme Corp" 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mobile Number</label>
                <input 
                  value={newCustomer.mobileNumber} 
                  onChange={(e) => setNewCustomer({...newCustomer, mobileNumber: e.target.value})} 
                  required 
                  style={styles.input} 
                  placeholder="e.g. 9876543210" 
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  {loading ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  mainCard: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)", border: "1px solid #e2e8f0", overflow: "hidden" },
  
  topBar: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #e2e8f0" },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center", flex: 1, maxWidth: "400px" },
  searchInput: { padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", width: "100%", outline: "none", background: "#f8fafc" },
  
  actionGroup: { display: "flex", alignItems: "center", gap: "12px" },
  primaryBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#15803d", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" },
  secondaryBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #e2e8f0", transition: "background 0.2s", ":hover": { background: "#f8fafc" } },
  td: { padding: "16px 24px", fontSize: "14px", color: "#475569" },
  statusBadge: { background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block" },
  
  actionIcon: { background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "6px", marginLeft: "5px", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", ":hover": { background: "#f1f5f9" } },
  
  tableFooter: { padding: "16px 24px", fontSize: "13px", color: "#64748b", borderTop: "1px solid #e2e8f0", background: "#f8fafc", textAlign: "right" },

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "450px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  closeBtn: { background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#334155" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" },
  cancelBtn: { padding: "10px 20px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  
  successBox: { padding: "16px", background: "#dcfce7", color: "#15803d", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "500", border: "1px solid #bbf7d0" },
  errorBox: { padding: "16px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "500", border: "1px solid #fecaca" },
};

please give me profesional design to my login page,register page,main dashboard page and customer page also proper header, ball icon remove, used my logo in login page,register page,dashboard header etc

