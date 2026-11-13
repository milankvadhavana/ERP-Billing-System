import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import API from "./api";
import { Search, ArrowLeft } from "lucide-react";

export default function Ledger() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  // States for Customer List
  const [customers, setCustomers] = useState([]);
  const [customersWithTransactions, setCustomersWithTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // States for Ledger Detail
  const [ledgerData, setLedgerData] = useState(null);
  const [customerName, setCustomerName] = useState("Customer");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    if (!customerId) {
      fetchCustomersAndTransactions();
    } else {
      fetchLedgerAndCustomer(customerId);
    }
  }, [customerId]);

  const fetchCustomersAndTransactions = async () => {
    try {
      const [custRes, invRes, payRes] = await Promise.all([
        API.get("/customers/all"),
        API.get("/invoices/all"),
        API.get("/payments/dashboard")
      ]);
      
      const allCustomers = custRes.data;
      
      // Create a Set of active customer IDs
      const activeIds = new Set([
        ...invRes.data.map(i => i.customerId),
        ...payRes.data.filter(p => p.totalPaid > 0).map(p => p.id)
      ]);

      setCustomers(allCustomers);
      setCustomersWithTransactions(allCustomers.filter(c => activeIds.has(c.id)));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLedgerAndCustomer = async (id) => {
    setLoading(true);
    try {
      // Fetch both the ledger data AND all customers to find the name
      const [ledgerRes, custRes] = await Promise.all([
        API.get(`/invoices/ledger/${id}`),
        API.get("/customers/all")
      ]);
      
      setLedgerData(ledgerRes.data);
      
      // Find the customer name
      const customer = custRes.data.find(c => c.id === id);
      if (customer) {
        setCustomerName(customer.organizationName);
      }
      
      // Set customers array so it's ready if we navigate back
      setCustomers(custRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // --- VIEW 1: CUSTOMER SELECTION LIST ---
  if (!customerId) {
    const filteredCustomers = customersWithTransactions.filter(c => 
      c.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobileNumber.includes(searchTerm)
    );

    return (
      <Layout title="Customer Ledger" headerColor="#a16207">
        <div style={styles.mainCard}>
          <div style={styles.topBar}>
            <h2 style={{ margin: 0, color: "#1e293b" }}>Select a Customer</h2>
            <div style={styles.searchWrapper}>
              <Search size={18} color="#94a3b8" style={{ position: "absolute", left: 14 }} />
              <input
                type="text"
                placeholder="Search customer by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
          
          {filteredCustomers.length === 0 ? (
             <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                No customers with transactions found.
             </div>
          ) : (
            <div style={styles.customerGrid}>
              {filteredCustomers.map(c => (
                <div key={c.id} style={styles.customerCard} onClick={() => navigate(`/ledger/${c.id}`)}>
                  <div style={styles.customerAvatar}>{c.organizationName.charAt(0).toUpperCase()}</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, color: "#1e293b" }}>{c.organizationName}</h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>{c.mobileNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- VIEW 2: DETAILED LEDGER ---
  if (loading || !ledgerData) return <Layout title="Loading..."><div style={{padding: 40, textAlign: "center"}}>Loading Ledger Data...</div></Layout>;

  const { transactions, totalInvoiced, totalPaid, outstanding } = ledgerData;

  const filteredTransactions = transactions.filter(txn => {
    if (dateRange.from && txn.date < dateRange.from) return false;
    if (dateRange.to && txn.date > dateRange.to) return false;
    return true;
  });

  let runningBalance = 0;

  return (
    <Layout title="Customer Ledger" headerColor="#a16207">
      <div style={styles.mainCard}>
        
        {/* Header Row */}
        <div style={styles.headerRow}>
          <h2 style={{ margin: 0, fontSize: 24, color: "#1e293b" }}>
            {customerName} <span style={{fontSize: 16, color: "#64748b", fontWeight: "normal"}}>({customerId.slice(-4)})</span>
          </h2>
          <Link to="/ledger" style={styles.backBtn}>
            <ArrowLeft size={16} /> Back to Customers
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, background: "#e0f2fe", color: "#0284c7"}}>
            <p style={styles.statLabel}>Total Invoiced</p>
            <h3 style={styles.statValue}>₹{totalInvoiced.toFixed(2)}</h3>
          </div>
          <div style={{...styles.statCard, background: "#dcfce7", color: "#16a34a"}}>
            <p style={styles.statLabel}>Total Paid</p>
            <h3 style={styles.statValue}>₹{totalPaid.toFixed(2)}</h3>
          </div>
          <div style={{...styles.statCard, background: "#fee2e2", color: "#dc2626"}}>
            <p style={styles.statLabel}>Outstanding</p>
            <h3 style={styles.statValue}>₹{outstanding.toFixed(2)}</h3>
          </div>
        </div>

        {/* Date Filters */}
        <div style={styles.filterRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>From Date</label>
            <input type="date" style={styles.dateInput} value={dateRange.from} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>To Date</label>
            <input type="date" style={styles.dateInput} value={dateRange.to} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} />
          </div>
          <button style={styles.searchBtn} onClick={() => {}}>
            <Search size={16} /> Search
          </button>
        </div>

        {/* Ledger Table */}
        <div style={{ overflowX: "auto", marginTop: 20 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Reference</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Description</th>
                <th style={{...styles.th, textAlign: "right"}}>Debit (₹)</th>
                <th style={{...styles.th, textAlign: "right"}}>Credit (₹)</th>
                <th style={{...styles.th, textAlign: "right"}}>Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No transactions found for this period.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, index) => {
                  runningBalance += txn.debit - txn.credit;
                  
                  return (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{txn.date}</td>
                      <td style={{...styles.td, color: "#2563eb", fontWeight: "600"}}>
                        {txn.reference}
                      </td>
                      <td style={styles.td}>
                        <span style={txn.type === 'Invoice' ? styles.typeBadgeInvoice : styles.typeBadgePayment}>
                          {txn.type}
                        </span>
                      </td>
                      <td style={styles.td}>{txn.description}</td>
                      <td style={{...styles.td, textAlign: "right"}}>
                        {txn.debit > 0 ? `₹${txn.debit.toFixed(2)}` : "-"}
                      </td>
                      <td style={{...styles.td, textAlign: "right"}}>
                        {txn.credit > 0 ? `₹${txn.credit.toFixed(2)}` : "-"}
                      </td>
                      <td style={{...styles.td, textAlign: "right", fontWeight: "bold"}}>
                        ₹{runningBalance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  mainCard: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 30, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 15 },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center", flex: 1, maxWidth: 400 },
  searchInput: { padding: "11px 12px 11px 42px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, width: "100%", outline: "none", background: "#f8fafc" },
  customerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  customerCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 15, cursor: "pointer", transition: "transform 0.2s, boxShadow 0.2s" },
  customerAvatar: { width: 48, height: 48, borderRadius: 12, background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  backBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#f1f5f9", color: "#334155", textDecoration: "none", borderRadius: 8, fontSize: 14, fontWeight: "600" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 30 },
  statCard: { padding: 20, borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 },
  statLabel: { margin: 0, fontSize: 14, fontWeight: "600", opacity: 0.8 },
  statValue: { margin: 0, fontSize: 26, fontWeight: "800" },
  filterRow: { display: "flex", alignItems: "flex-end", gap: 15, paddingBottom: 20, borderBottom: "1px solid #e2e8f0" },
  inputGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  dateInput: { padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" },
  searchBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#a16207", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "600", cursor: "pointer", height: 42 },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "16px 20px", fontSize: 14, color: "#334155" },
  typeBadgeInvoice: { background: "#fee2e2", color: "#b91c1c", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: "600" },
  typeBadgePayment: { background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: "600" },
};