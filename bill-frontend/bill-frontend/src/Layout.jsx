import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, FileText,
  CreditCard, BookOpen, Settings, LogOut, ChevronDown, CalendarDays,
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { colors, GlobalStyles } from "./theme";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Invoices", path: "/invoices", icon: FileText },
  { name: "Payments", path: "/payments", icon: CreditCard },
  { name: "Ledger", path: "/ledger", icon: BookOpen },
];

// headerColor kept in props so existing pages don't break (it is no longer used)
export default function Layout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });

  const NavLink = ({ to, icon: Icon, children: label }) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={active ? "" : "sj-nav"} style={active ? styles.navItemActive : styles.navItem}>
        <Icon size={19} style={{ marginRight: 12, flexShrink: 0 }} />
        {label}
      </Link>
    );
  };

  return (
    <div style={styles.appContainer}>
      <GlobalStyles />

      {/* SIDEBAR */}
      <aside className="sj-sidebar" style={styles.sidebar}>
        <div style={styles.brandContainer}>
          <BrandLogo />
        </div>

        <div style={styles.menuLabel}>MENU</div>
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <NavLink key={item.name} to={item.path} icon={item.icon}>{item.name}</NavLink>
          ))}
        </nav>

        <div style={styles.bottomSection}>
          {/* <NavLink to="/settings" icon={Settings}>Settings</NavLink> */}
          <button onClick={handleLogout} className="sj-nav" style={styles.logoutBtn}>
            <LogOut size={19} style={{ marginRight: 12 }} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={styles.mainWrapper}>
        <header className="sj-header" style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>{title}</h2>
            {subtitle && <p style={styles.headerSubtitle}>{subtitle}</p>}
          </div>

          <div style={styles.headerRight}>
            <div className="sj-date" style={styles.dateChip}>
              <CalendarDays size={16} color={colors.orange} />
              {today}
            </div>
            <div style={styles.divider} />
            <div style={styles.userProfile}>
              <div style={styles.avatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={styles.userName}>{user?.name || "Admin"}</div>
                <div style={styles.userRole}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <main className="sj-content" style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  appContainer: { display: "flex", minHeight: "100vh", width: "100%", background: colors.bg },

  sidebar: { width: 260, background: colors.ink, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  brandContainer: { borderBottom: `3px solid ${colors.orange}` },
  menuLabel: { padding: "22px 28px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "#475569" },
  nav: { display: "flex", flexDirection: "column", padding: "0 14px", gap: 4, flex: 1 },
  navItem: { display: "flex", alignItems: "center", padding: "11px 16px", color: "#94a3b8", textDecoration: "none", borderRadius: 10, fontSize: 14.5, fontWeight: 500 },
  navItemActive: { display: "flex", alignItems: "center", padding: "11px 16px", color: "#fff", textDecoration: "none", borderRadius: 10, fontSize: 14.5, fontWeight: 600, background: colors.orange, boxShadow: "0 6px 14px rgba(249,115,22,.35)" },
  bottomSection: { padding: "14px", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: 4 },
  logoutBtn: { display: "flex", alignItems: "center", background: "transparent", color: "#f87171", border: "none", padding: "11px 16px", width: "100%", fontSize: 14.5, fontWeight: 500, cursor: "pointer", textAlign: "left", borderRadius: 10, fontFamily: "inherit" },

  mainWrapper: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  header: { height: 76, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", background: "#fff", borderBottom: `1px solid ${colors.border}`, position: "sticky", top: 0, zIndex: 10 },
  headerTitle: { fontSize: 22, fontWeight: 800, color: colors.ink, letterSpacing: "-0.3px" },
  headerSubtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  headerRight: { display: "flex", alignItems: "center", gap: 20 },
  dateChip: { display: "flex", alignItems: "center", gap: 8, background: colors.orangeSoft, color: "#9a3412", padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600 },
  divider: { width: 1, height: 32, background: colors.border },
  userProfile: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
  avatar: { background: `linear-gradient(135deg, ${colors.orange}, ${colors.orangeDark})`, color: "#fff", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontWeight: 700, fontSize: 16 },
  userName: { fontSize: 14, fontWeight: 700, color: colors.ink },
  userRole: { fontSize: 12, color: colors.muted },
  content: { padding: 40, flex: 1 },
};
