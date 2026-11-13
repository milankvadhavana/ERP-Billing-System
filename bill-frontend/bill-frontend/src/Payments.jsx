import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import API from "./api";
import { Search, CreditCard, BookOpen, X, Filter } from "lucide-react";

export default function Payments() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New Filter States
  const [filterType, setFilterType] = useState("outstanding"); // "all" or "outstanding"
  const [sortBy, setSortBy] = useState("highest"); // "highest", "lowest", "name"

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentData, setPaymentData] = useState({ date: new Date().toISOString().split("T")[0], amount: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/payments/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (customer) => {
    setSelectedCustomer(customer);
    setPaymentData({ date: new Date().toISOString().split("T")[0], amount: "", description: "" });
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/payments/add", {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.organizationName,
        date: paymentData.date,
        amount: parseFloat(paymentData.amount),
        description: paymentData.description
      });
      setMessage({ type: "success", text: "Payment recorded successfully!" });
      setIsModalOpen(false);
      fetchDashboard();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save payment" });
    }
    setLoading(false);
  };

  // Apply Filters & Sorting Logic
  const processedData = data
    .filter(c => {
      // 1. Text Search
      const matchesSearch = c.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobileNumber.includes(searchTerm);
      
      // 2. Transaction Filter (Only show if they have invoiced or paid something)
      const hasTransactions = c.totalInvoiced > 0 || c.totalPaid > 0;

      // 3. Status Filter
      const matchesStatus = filterType === "all" ? hasTransactions : (c.outstanding > 0);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "highest") return b.outstanding - a.outstanding;
      if (sortBy === "lowest") return a.outstanding - b.outstanding;
      if (sortBy === "name") return a.organizationName.localeCompare(b.organizationName);
      return 0;
    });

  return (
    <Layout title="Payment Management" headerColor="#0f766e">
      {message.text && (
        <div style={message.type === "success" ? styles.successBox : styles.errorBox}>{message.text}</div>
      )}

      <div style={styles.mainCard}>
        
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <h3 style={{ margin: 0, color: "#1e293b" }}>Customer Financials</h3>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Manage payments and view outstanding balances</p>
          </div>
          
          <div style={styles.actionRow}>
            <div style={styles.searchWrapper}>
              <Search size={18} color="#94a3b8" style={{ position: "absolute", left: 14 }} />
              <input
                type="text"
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* New Filters */}
            <select style={styles.filterSelect} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="outstanding">With Outstanding Only</option>
              <option value="all">All Active Customers</option>
            </select>

            <select style={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="highest">Highest Outstanding</option>
              <option value="lowest">Lowest Outstanding</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Customer Name</th>
                <th style={styles.th}>Phone</th>
                <th style={{...styles.th, textAlign: "right"}}>Total Invoiced</th>
                <th style={{...styles.th, textAlign: "right"}}>Total Paid</th>
                <th style={{...styles.th, textAlign: "right"}}>Outstanding</th>
                <th style={{...styles.th, textAlign: "center"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {processedData.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No customers found matching your criteria.</td></tr>
              ) : (
                processedData.map((c, index) => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={{...styles.td, fontWeight: "600", color: "#1e293b"}}>{c.organizationName}</td>
                    <td style={styles.td}>{c.mobileNumber}</td>
                    <td style={{...styles.td, textAlign: "right"}}>₹{c.totalInvoiced.toFixed(2)}</td>
                    <td style={{...styles.td, textAlign: "right", color: "#16a34a"}}>₹{c.totalPaid.toFixed(2)}</td>
                    <td style={{...styles.td, textAlign: "right", fontWeight: "bold", color: c.outstanding > 0 ? "#dc2626" : "#16a34a"}}>
                      ₹{c.outstanding.toFixed(2)}
                    </td>
                    <td style={{...styles.td, textAlign: "center"}}>
                      <button onClick={() => handleOpenModal(c)} style={styles.payBtn} title="Record Payment">
                        <CreditCard size={16} /> Pay
                      </button>
                      <Link to={`/ledger/${c.id}`} style={styles.ledgerBtn} title="View Ledger">
                        <BookOpen size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: "#1e293b" }}>Record Payment</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            
            <p style={{ marginTop: 0, color: "#64748b", fontSize: 14 }}>
              Recording payment for <strong>{selectedCustomer?.organizationName}</strong>. 
              Outstanding: <span style={{color: "#dc2626", fontWeight: "bold"}}>₹{selectedCustomer?.outstanding.toFixed(2)}</span>
            </p>

            <form onSubmit={handleSavePayment} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Payment Date</label>
                <input type="date" required value={paymentData.date} onChange={(e) => setPaymentData({...paymentData, date: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Amount (₹)</label>
                <input type="number" step="0.01" min="1" required placeholder="e.g. 5000" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description / Reference</label>
                <input type="text" placeholder="e.g. Cash payment / UPI Ref 1234" value={paymentData.description} onChange={(e) => setPaymentData({...paymentData, description: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? "Saving..." : "Save Payment"}
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
  mainCard: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" },
  topBar: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 15, borderBottom: "1px solid #e2e8f0" },
  actionRow: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center", minWidth: 250 },
  searchInput: { padding: "11px 12px 11px 42px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, width: "100%", outline: "none", background: "#f8fafc" },
  filterSelect: { padding: "11px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", background: "#f8fafc", color: "#334155", cursor: "pointer" },
  
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "16px 24px", fontSize: 14, color: "#334155" },
  
  payBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#0f766e", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: "600", cursor: "pointer", marginRight: 10 },
  ledgerBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 6, cursor: "pointer" },

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: "450px", padding: 30, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  closeBtn: { background: "#f1f5f9", border: "none", cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" },
  form: { display: "flex", flexDirection: "column", gap: 15, marginTop: 20 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155" },
  input: { padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 15 },
  cancelBtn: { padding: "10px 20px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "600", cursor: "pointer" },
  submitBtn: { padding: "10px 20px", background: "#0f766e", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "600", cursor: "pointer" },

  successBox: { padding: "16px", background: "#dcfce7", color: "#15803d", borderRadius: 8, marginBottom: "20px", fontSize: 14, fontWeight: "500", border: "1px solid #bbf7d0" },
  errorBox: { padding: "16px", background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: "20px", fontSize: 14, fontWeight: "500", border: "1px solid #fecaca" },
};