import { useEffect, useState, useRef } from "react";
import Layout from "./Layout";
import API from "./api";
import { colors } from "./theme";
import { Plus, Upload, Search, Edit, Trash2, X, Users } from "lucide-react";

export default function Customers() {
  const fileInputRef = useRef(null);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State to track if we are adding or editing
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ organizationName: "", mobileNumber: "" });
  
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Auto-hide the success / error banner
  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customers/all");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers", err);
    }
  };

  // Open modal for Adding (pass null) or Editing (pass customer object)
  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        organizationName: customer.organizationName,
        mobileNumber: customer.mobileNumber,
      });
    } else {
      setEditingId(null);
      setFormData({ organizationName: "", mobileNumber: "" });
    }
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      if (editingId) {
        // Update existing customer
        await API.put(`/customers/update/${editingId}`, formData);
        setMessage({ type: "success", text: "Customer updated successfully!" });
      } else {
        // Add new customer
        await API.post("/customers/add", formData);
        setMessage({ type: "success", text: "Customer added successfully!" });
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Operation failed." });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      await API.delete(`/customers/delete/${id}`);
      setMessage({ type: "success", text: "Customer deleted successfully!" });
      fetchCustomers();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete customer." });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await API.post("/customers/upload", uploadData, {
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

  const filteredCustomers = customers.filter(
    (c) =>
      c.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobileNumber.includes(searchTerm)
  );

  return (
    <Layout title="Customer Management" subtitle="Add, search and manage your customers">
      {message.text && (
        <div style={message.type === "success" ? styles.successBox : styles.errorBox}>{message.text}</div>
      )}

      <div style={styles.mainCard}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#94a3b8" style={{ position: "absolute", left: 14 }} />
            <input
              type="text"
              className="sj-input"
              placeholder="Search customer by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.actionGroup}>
            <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} style={{ display: "none" }} id="csv-upload" />
            {/* Uncommented Bulk Upload for functionality, styled cleanly */}
            <label htmlFor="csv-upload" className="sj-btn-ghost" style={styles.secondaryBtn}>
              <Upload size={16} /> Bulk Upload
            </label>
            <button onClick={() => handleOpenModal()} className="sj-btn-primary" style={styles.primaryBtn}>
              <Plus size={18} /> Add Customer
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 60 }}>#</th>
                <th style={styles.th}>Organization</th>
                <th style={styles.th}>Mobile Number</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.empty}>
                    <Users size={36} color="#cbd5e1" />
                    <div style={{ marginTop: 10, fontWeight: 600, color: colors.text }}>No customers found</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Try a different search or add a new customer.</div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, index) => (
                  <tr key={c.id} className="sj-row" style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={styles.avatar}>{c.organizationName.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: 600, color: colors.ink }}>{c.organizationName}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{c.mobileNumber}</td>
                    <td style={styles.td}><span style={styles.statusBadge}>Active</span></td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {/* Wired up Edit Button */}
                      <button onClick={() => handleOpenModal(c)} className="sj-icon-btn" style={styles.actionIcon} title="Edit">
                        <Edit size={16} color="#3b82f6" />
                      </button>
                      {/* Wired up Delete Button */}
                      <button onClick={() => handleDelete(c.id)} className="sj-icon-btn" style={styles.actionIcon} title="Delete">
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.tableFooter}>
          Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customers
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: colors.ink }}>
                {editingId ? "Edit Customer" : "Add New Customer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Organization Name</label>
                <input
                  className="sj-input"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mobile Number</label>
                <input
                  className="sj-input"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={loading} className="sj-btn-primary" style={styles.primaryBtn}>
                  {loading ? "Saving..." : (editingId ? "Update Customer" : "Save Customer")}
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
  mainCard: { background: "#fff", borderRadius: 14, border: `1px solid ${colors.border}`, overflow: "hidden" },

  topBar: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, borderBottom: `1px solid ${colors.border}` },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center", flex: 1, maxWidth: 420 },
  searchInput: { padding: "11px 12px 11px 42px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, width: "100%", outline: "none", background: "#f8fafc", fontFamily: "inherit" },

  actionGroup: { display: "flex", alignItems: "center", gap: 12 },
  primaryBtn: { display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", background: colors.orange, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  secondaryBtn: { display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", background: "#fff", color: colors.text, border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "14px 24px", background: "#f8fafc", borderBottom: `1px solid ${colors.border}`, fontSize: 11.5, fontWeight: 700, color: colors.muted, textTransform: "uppercase", letterSpacing: "0.6px" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 24px", fontSize: 14, color: "#475569", borderBottom: "1px solid #f1f5f9" },
  avatar: { width: 36, height: 36, borderRadius: 10, background: colors.orangeSoft, color: colors.orangeDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 },
  statusBadge: { background: "#dcfce7", color: "#15803d", padding: "4px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "inline-block" },
  actionIcon: { background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 8, marginLeft: 4, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", padding: "56px 20px", color: colors.muted },

  tableFooter: { padding: "14px 24px", fontSize: 13, color: colors.muted, background: "#f8fafc", textAlign: "right" },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modalContent: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: 26, boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  closeBtn: { background: "#f1f5f9", border: "none", cursor: "pointer", color: colors.muted, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13.5, fontWeight: 600, color: colors.text },
  input: { padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", background: "#f8fafc", fontFamily: "inherit" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  cancelBtn: { padding: "11px 20px", background: "#f1f5f9", color: colors.text, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  successBox: { padding: "14px 16px", background: "#dcfce7", color: "#15803d", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500, border: "1px solid #bbf7d0" },
  errorBox: { padding: "14px 16px", background: "#fee2e2", color: "#b91c1c", borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500, border: "1px solid #fecaca" },
};