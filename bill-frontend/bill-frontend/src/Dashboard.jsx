<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, CheckCircle2, AlertCircle, Package, Plus, 
  BookOpen, ArrowRight, Calendar, Filter 
} from "lucide-react";
import Layout from "./Layout";
import { colors } from "./theme";
import API from "./api";

const statusStyle = {
  "Paid": { background: "#dcfce7", color: "#15803d" },
  "Partially Paid": { background: "#fef3c7", color: "#b45309" },
  "Unpaid": { background: "#fee2e2", color: "#b91c1c" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState("all");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  const fetchStats = async (start, end) => {
    setLoading(true);
    try {
      let url = "/dashboard/stats";
      if (start && end) {
        url += `?startDate=${start}&endDate=${end}`;
      }
      const res = await API.get(url);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial load (All Time)
    fetchStats();
  }, []);

  // Handle Quick Date Filters
  const handleQuickFilter = (type) => {
    setDateFilter(type);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (type === "today") {
      start = today;
      end = today;
    } else if (type === "week") {
      // Start of current week (Sunday)
      const day = today.getDay();
      start.setDate(today.getDate() - day);
    } else if (type === "month") {
      // Start of current month
      start.setDate(1);
    } else if (type === "last_month") {
      // Last month
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (type === "all") {
      fetchStats();
      return;
    }

    const s = start.toISOString().split("T")[0];
    const e = end.toISOString().split("T")[0];
    
    setCustomDates({ start: s, end: e });
    fetchStats(s, e);
  };

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    setDateFilter("custom");
    fetchStats(customDates.start, customDates.end);
  };

  if (loading && !data) {
    return (
      <Layout title="Dashboard" subtitle="Loading your business overview...">
        <div style={{ padding: 50, textAlign: "center", color: colors.muted }}>Loading data...</div>
      </Layout>
    );
  }

  const formatCurrency = (val) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    { label: "Total Sales", value: formatCurrency(data?.totalSales || 0), icon: TrendingUp, bg: "#e0f2fe", fg: "#0284c7" },
    { label: "Received", value: formatCurrency(data?.totalReceived || 0), icon: CheckCircle2, bg: "#dcfce7", fg: "#16a34a" },
    { label: "Outstanding", value: formatCurrency(data?.totalOutstanding || 0), icon: AlertCircle, bg: "#fee2e2", fg: "#dc2626" },
    { label: "Products", value: (data?.totalProducts || 0).toString(), icon: Package, bg: "#ffedd5", fg: "#ea580c" },
  ];

  return (
    <Layout title="Dashboard" subtitle="Overview of your sales, stock and payments">
      
      {/* NEW: DATE FILTER BAR */}
      <div style={styles.filterBar}>
        <div style={styles.quickFilters}>
          <button onClick={() => handleQuickFilter("today")} style={dateFilter === "today" ? styles.filterBtnActive : styles.filterBtn}>Today</button>
          <button onClick={() => handleQuickFilter("week")} style={dateFilter === "week" ? styles.filterBtnActive : styles.filterBtn}>This Week</button>
          <button onClick={() => handleQuickFilter("month")} style={dateFilter === "month" ? styles.filterBtnActive : styles.filterBtn}>This Month</button>
          {/* <button onClick={() => handleQuickFilter("last_month")} style={dateFilter === "last_month" ? styles.filterBtnActive : styles.filterBtn}>Last Month</button> */}
          <button onClick={() => handleQuickFilter("all")} style={dateFilter === "all" ? styles.filterBtnActive : styles.filterBtn}>All Time</button>
        </div>

        <form onSubmit={handleCustomDateSubmit} style={styles.customDateForm}>
          <Calendar size={16} color="#64748b" />
          <input type="date" value={customDates.start} onChange={(e) => setCustomDates({...customDates, start: e.target.value})} style={styles.dateInput} required />
          <span style={{fontSize: 13, color: "#64748b"}}>to</span>
          <input type="date" value={customDates.end} onChange={(e) => setCustomDates({...customDates, end: e.target.value})} style={styles.dateInput} required />
          <button type="submit" style={styles.searchBtn}>Apply</button>
        </form>
      </div>

      {/* STATS */}
      <div className="sj-stats" style={styles.statsGrid}>
        {stats.map(({ label, value, icon: Icon, bg, fg }) => (
          <div key={label} className="sj-stat" style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: bg }}>
              <Icon size={22} color={fg} />
            </div>
            <div>
              <div style={styles.statLabel}>{label}</div>
              <div style={styles.statValue}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={styles.actionsRow}>
        <button className="sj-btn-primary" onClick={() => navigate("/invoices/create")} style={styles.primaryAction}>
          <Plus size={18} /> New Invoice
        </button>
        <button className="sj-btn-ghost" onClick={() => navigate("/products")} style={styles.secondaryAction}>
          <Package size={17} /> Manage Stock
        </button>
        <button className="sj-btn-ghost" onClick={() => navigate("/ledger")} style={styles.secondaryAction}>
          <BookOpen size={17} /> View Ledger
        </button>
      </div>

      {/* CONTENT */}
      <div className="sj-grid" style={styles.contentGrid}>
        {/* RECENT INVOICES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Invoices</h3>
            <button onClick={() => navigate("/invoices")} style={styles.linkBtn}>
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div style={{ overflowX: "auto", opacity: loading ? 0.5 : 1 }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Invoice", "Customer", "Date", "Total", "Status"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!data?.recentInvoices || data.recentInvoices.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: "center", padding: 20, color: colors.muted}}>No invoices found for this period.</td></tr>
                ) : (
                  data.recentInvoices.map((inv) => (
                    <tr key={inv.id} className="sj-row" onClick={() => navigate(`/invoices/edit/${inv.id}`)} style={{ cursor: "pointer" }}>
                      <td style={{ ...styles.td, color: "#0284c7", fontWeight: 600 }}>{inv.invoiceNo}</td>
                      <td style={{ ...styles.td, color: colors.ink, fontWeight: 500 }}>{inv.customerName}</td>
                      <td style={styles.td}>{inv.date}</td>
                      <td style={{ ...styles.td, fontWeight: 600, color: colors.ink }}>{formatCurrency(inv.totalAmount)}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...statusStyle[inv.paymentStatus] }}>{inv.paymentStatus}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Stock Alerts</h3>
            
            {!data?.lowStockAlerts || data.lowStockAlerts.length === 0 ? (
                <p style={{ fontSize: 14, color: colors.muted, margin: 0 }}>All products are sufficiently stocked!</p>
            ) : (
                data.lowStockAlerts.map((item, i) => (
                  <div key={item.name} style={{ 
                      ...styles.alertRow, 
                      borderBottom: i === data.lowStockAlerts.length - 1 ? "none" : styles.alertRow.borderBottom 
                  }}>
                    <span style={styles.alertName}>
                      {item.name} <small style={styles.small}>{item.stockQty} left</small>
                    </span>
                    {item.isOutOfStock ? (
                        <span style={{ ...styles.badge, background: "#fee2e2", color: "#b91c1c" }}>Out of Stock</span>
                    ) : (
                        <span style={{ ...styles.badge, background: "#fef3c7", color: "#b45309" }}>Low Stock</span>
                    )}
                  </div>
                ))
            )}
          </div>


          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Top Outstanding</h3>
            {!data?.topOutstanding || data.topOutstanding.length === 0 ? (
                <p style={{ fontSize: 14, color: colors.muted }}>No outstanding balances for this period!</p>
            ) : (
                data.topOutstanding.map((o, i) => (
                <div key={o.name} style={{ ...styles.alertRow, borderBottom: i === data.topOutstanding.length - 1 ? "none" : styles.alertRow.borderBottom }}>
                    <span style={styles.alertName}>{o.name}</span>
                    <span style={{ color: "#dc2626", fontWeight: 700 }}>{formatCurrency(o.amount)}</span>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  filterBar: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "12px 20px", borderRadius: 12, border: `1px solid ${colors.border}`, marginBottom: 24, flexWrap: "wrap", gap: 15 },
  quickFilters: { display: "flex", gap: 10 },
  filterBtn: { background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "all 0.2s" },
  filterBtnActive: { background: colors.orange, border: `1px solid ${colors.orange}`, color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  customDateForm: { display: "flex", alignItems: "center", gap: 10 },
  dateInput: { padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, outline: "none", color: "#334155" },
  searchBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 },
  statCard: { background: "#fff", padding: 22, borderRadius: 14, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 16 },
  statIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { fontSize: 13, fontWeight: 600, color: colors.muted, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 800, color: colors.ink, letterSpacing: "-0.3px" },

  actionsRow: { display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" },
  primaryAction: { display: "flex", alignItems: "center", gap: 8, background: colors.orange, color: "#fff", border: "none", padding: "12px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  secondaryAction: { display: "flex", alignItems: "center", gap: 8, background: "#fff", color: colors.inkSoft, border: "1px solid #cbd5e1", padding: "12px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  contentGrid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" },
  rightColumn: { display: "flex", flexDirection: "column", gap: 24 },
  card: { background: "#fff", padding: 24, borderRadius: 14, border: `1px solid ${colors.border}` },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: colors.ink, marginBottom: 14 },
  linkBtn: { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: colors.orange, fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 12px", background: "#f8fafc", borderBottom: `1px solid ${colors.border}`, fontSize: 11.5, color: colors.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px" },
  td: { padding: "15px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 14, color: colors.text, whiteSpace: "nowrap" },
  badge: { padding: "4px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "inline-block" },
  alertRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 },
  alertName: { color: colors.ink, fontWeight: 500 },
  small: { color: colors.muted, fontWeight: 400, marginLeft: 6 },
};
=======
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome, {user.name} 👋</h1>
      <p>Email: {user.email}</p>
      <p>User ID: {user.userId}</p>
      <button onClick={logout} style={{ padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        Logout
      </button>
    </div>
  );
}
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
