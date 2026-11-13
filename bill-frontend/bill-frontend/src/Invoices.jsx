import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import API from "./api";
import { Plus, Search, Edit, Trash2, Eye, X } from "lucide-react";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  
  // State for the View Modal
  const [viewInvoice, setViewInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await API.get("/invoices/all");
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await API.delete(`/invoices/delete/${id}`);
      fetchInvoices();
    } catch (err) {
      alert("Failed to delete invoice");
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || inv.paymentStatus === filterStatus;
    const matchesDate = !filterDate || inv.date === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <Layout title="Invoice Management" headerColor="#9333ea">
      <div style={styles.mainCard}>
        <div style={styles.topBar}>
          <div style={styles.filtersGroup}>
            <div style={styles.searchWrapper}>
              <Search size={18} color="#94a3b8" style={{ position: "absolute", left: 14 }} />
              <input
                type="text"
                placeholder="Search by invoice no or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
            </select>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={styles.filterSelect} />
          </div>
          <Link to="/invoices/create" style={styles.primaryBtn}>
            <Plus size={18} /> Create Invoice
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Invoice No</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Total (₹)</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} style={styles.tr}>
                  <td style={{...styles.td, fontWeight: "600"}}>{inv.invoiceNo}</td>
                  <td style={styles.td}>{inv.date}</td>
                  <td style={styles.td}>{inv.customerName}</td>
                  <td style={styles.td}>₹{inv.totalAmount.toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: inv.paymentStatus === 'Paid' ? '#dcfce7' : inv.paymentStatus === 'Unpaid' ? '#fee2e2' : '#fef3c7',
                      color: inv.paymentStatus === 'Paid' ? '#15803d' : inv.paymentStatus === 'Unpaid' ? '#b91c1c' : '#b45309'
                    }}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      {/* NOW OPENS MODAL INSTEAD OF ALERT */}
                      <button onClick={() => setViewInvoice(inv)} style={styles.actionIcon} title="View"><Eye size={16} color="#8b5cf6" /></button>
                      <Link to={`/invoices/edit/${inv.id}`} style={styles.actionIcon} title="Edit"><Edit size={16} color="#3b82f6" /></Link>
                      <button onClick={() => handleDelete(inv.id)} style={styles.actionIcon} title="Delete"><Trash2 size={16} color="#ef4444" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW INVOICE MODAL */}
      {viewInvoice && (
        <div style={styles.modalOverlay} onClick={() => setViewInvoice(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{margin: 0, color: "#1e293b"}}>{viewInvoice.invoiceNo}</h2>
              <button onClick={() => setViewInvoice(null)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.infoRow}>
                <div>
                  <p style={styles.infoLabel}>Billed To:</p>
                  <p style={styles.infoText}><strong>{viewInvoice.customerName}</strong></p>
                </div>
                <div style={{textAlign: "right"}}>
                  <p style={styles.infoLabel}>Date:</p>
                  <p style={styles.infoText}>{viewInvoice.date}</p>
                  <p style={styles.infoLabel}>Status:</p>
                  <p style={styles.infoText}>{viewInvoice.paymentStatus}</p>
                </div>
              </div>

              <table style={styles.modalTable}>
                <thead>
                  <tr>
                    <th style={styles.mTh}>Item</th>
                    <th style={styles.mTh}>Qty</th>
                    <th style={styles.mTh}>Price</th>
                    <th style={styles.mTh}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={styles.mTd}>{item.productName}</td>
                      <td style={styles.mTd}>{item.quantity}</td>
                      <td style={styles.mTd}>₹{item.price.toFixed(2)}</td>
                      <td style={styles.mTd}>₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.modalTotals}>
                <div style={styles.totalRow}><span>Total:</span> <span>₹{viewInvoice.totalAmount.toFixed(2)}</span></div>
                <div style={styles.totalRow}><span>Paid:</span> <span>₹{viewInvoice.amountPaid.toFixed(2)}</span></div>
                <div style={{...styles.totalRow, fontWeight: "bold", color: viewInvoice.balance > 0 ? "#ef4444" : "#16a34a"}}>
                  <span>Balance Due:</span> <span>₹{viewInvoice.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  mainCard: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" },
  topBar: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 15, borderBottom: "1px solid #e2e8f0" },
  filtersGroup: { display: "flex", gap: 12, flex: 1, flexWrap: "wrap", maxWidth: "800px" },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center", flex: 1, minWidth: "250px" },
  searchInput: { padding: "11px 12px 11px 42px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, width: "100%", outline: "none", background: "#f8fafc" },
  filterSelect: { padding: "11px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", background: "#f8fafc", color: "#334155" },
  primaryBtn: { display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "#EA580C", color: "#fff", textDecoration: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "14px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "16px 24px", fontSize: 14, color: "#475569" },
  statusBadge: { padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  actionIcon: { display: "inline-flex", padding: 8, borderRadius: 8, background: "#f8fafc", border: "none", cursor: "pointer" },
  
  // Modal Styles
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: "700px", padding: 30, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 20, marginBottom: 20 },
  closeBtn: { background: "#f1f5f9", border: "none", cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" },
  infoRow: { display: "flex", justifyContent: "space-between", marginBottom: 30 },
  infoLabel: { fontSize: 12, color: "#64748b", textTransform: "uppercase", margin: "0 0 4px 0" },
  infoText: { fontSize: 15, color: "#1e293b", margin: 0 },
  modalTable: { width: "100%", borderCollapse: "collapse", marginBottom: 30 },
  mTh: { textAlign: "left", padding: "12px 0", borderBottom: "2px solid #e2e8f0", fontSize: 13, color: "#64748b" },
  mTd: { padding: "16px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14, color: "#334155" },
  modalTotals: { width: "250px", marginLeft: "auto", display: "flex", flexDirection: "column", gap: 10 },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 15, color: "#475569" }
};