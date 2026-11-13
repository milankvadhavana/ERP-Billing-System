import { useEffect, useState, useRef } from "react";
import Layout from "./Layout";
import API from "./api";
import { 
  Plus, Upload, Search, Edit, Trash2, 
  MoreVertical, X 
} from "lucide-react";

export default function Products() {
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // New Filter State
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track if we are editing
  
  const [formData, setFormData] = useState({ 
    productCode: "", productName: "", price: "", stockQty: "", minStock: "5" 
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products/all");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  // Helper for Stock Status badge
  const getStockStatus = (qty, min) => {
    if (qty === 0) return { label: "Out of Stock", bg: "#fee2e2", color: "#b91c1c", key: "out" };
    if (qty <= min) return { label: "Low Stock", bg: "#fef3c7", color: "#b45309", key: "low" };
    return { label: "In Stock", bg: "#dcfce7", color: "#15803d", key: "in" };
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        productCode: product.productCode,
        productName: product.productName,
        price: product.price,
        stockQty: product.stockQty,
        minStock: product.minStock
      });
    } else {
      setEditingId(null);
      setFormData({ productCode: "", productName: "", price: "", stockQty: "", minStock: "5" });
    }
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stockQty: parseInt(formData.stockQty),
      minStock: parseInt(formData.minStock)
    };

    try {
      if (editingId) {
        await API.put(`/products/update/${editingId}`, payload);
        setMessage({ type: "success", text: "Product updated successfully!" });
      } else {
        await API.post("/products/add", payload);
        setMessage({ type: "success", text: "Product added successfully!" });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Operation failed." });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await API.delete(`/products/delete/${id}`);
      setMessage({ type: "success", text: "Product deleted successfully!" });
      fetchProducts();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete product." });
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
      await API.post("/products/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage({ type: "success", text: "Bulk products uploaded successfully!" });
      fetchProducts();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Upload failed. Check CSV format." });
    }
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  // Filtering Logic (Search + Dropdown Status)
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const status = getStockStatus(p.stockQty, p.minStock);
    if (filterStatus === "All") return true;
    if (filterStatus === "In Stock") return status.key === "in";
    if (filterStatus === "Low Stock") return status.key === "low";
    if (filterStatus === "Out of Stock") return status.key === "out";
    return true;
  });

  return (
    <Layout title="Product Management" headerColor="#2563eb">
      
      {message.text && (
        <div style={message.type === "success" ? styles.successBox : styles.errorBox}>
          {message.text}
        </div>
      )}

      <div style={styles.mainCard}>
        
        {/* Top Bar with Search and Filter */}
        <div style={styles.topBar}>
          <div style={styles.searchFilterGroup}>
            <div style={styles.searchWrapper}>
              <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "12px" }} />
              <input 
                type="text" 
                placeholder="Search by name or code..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            {/* NEW: Filter Dropdown */}
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Categories</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div style={styles.actionGroup}>
            <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} style={{ display: 'none' }} id="csv-upload" />
            <label htmlFor="csv-upload" style={styles.secondaryBtn}>
              <Upload size={16} /> Bulk Upload
            </label>
            
            <button onClick={() => handleOpenModal()} style={styles.primaryBtn}>
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: "50px"}}>#</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Price (₹)</th>
                <th style={styles.th}>Stock Qty</th>
                <th style={styles.th}>Min Stock</th>
                <th style={styles.th}>Status</th>
                <th style={{...styles.th, textAlign: "right"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No products match your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, index) => {
                  const status = getStockStatus(p.stockQty, p.minStock);
                  return (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={{...styles.td, fontWeight: "600"}}>{p.productCode}</td>
                      <td style={styles.td}>{p.productName}</td>
                      <td style={styles.td}>₹{p.price.toFixed(2)}</td>
                      <td style={styles.td}>{p.stockQty}</td>
                      <td style={styles.td}>{p.minStock}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{...styles.td, textAlign: "right"}}>
                        {/* NEW: Edit Button Hooked Up */}
                        <button onClick={() => handleOpenModal(p)} style={styles.actionIcon}>
                          <Edit size={16} color="#3b82f6" />
                        </button>
                        {/* NEW: Delete Button Hooked Up */}
                        <button onClick={() => handleDelete(p.id)} style={styles.actionIcon}>
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={styles.tableFooter}>
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{margin: 0, fontSize: '20px', color: '#1e293b'}}>
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Product Code *</label>
                  <input 
                    value={formData.productCode} 
                    onChange={(e) => setFormData({...formData, productCode: e.target.value})} 
                    required 
                    style={styles.input} 
                    placeholder="e.g. P001" 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input 
                    value={formData.productName} 
                    onChange={(e) => setFormData({...formData, productName: e.target.value})} 
                    required 
                    style={styles.input} 
                    placeholder="e.g. Keyboard" 
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    required 
                    style={styles.input} 
                    placeholder="500.00" 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Stock Qty *</label>
                  <input 
                    type="number" 
                    value={formData.stockQty} 
                    onChange={(e) => setFormData({...formData, stockQty: e.target.value})} 
                    required 
                    style={styles.input} 
                    placeholder="25" 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Min Stock</label>
                  <input 
                    type="number" 
                    value={formData.minStock} 
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})} 
                    style={styles.input} 
                    placeholder="5" 
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  {loading ? "Saving..." : (editingId ? "Update Product" : "Save Product")}
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
  mainCard: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0", overflow: "hidden" },
  topBar: { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #e2e8f0" },
  
  // NEW: Flex container to hold Search and Filter next to each other
  searchFilterGroup: { display: "flex", gap: "15px", flex: 1, maxWidth: "600px" },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center", flex: 1 },
  searchInput: { padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", width: "100%", outline: "none", background: "#f8fafc" },
  
  // NEW: Filter Select Styles
  filterSelect: { padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", cursor: "pointer", color: "#334155" },

  actionGroup: { display: "flex", alignItems: "center", gap: "12px" },
  primaryBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "#F97316", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  secondaryBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#fff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #e2e8f0", transition: "background 0.2s" },
  td: { padding: "16px 24px", fontSize: "14px", color: "#475569" },
  statusBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block" },
  
  actionIcon: { background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "6px", marginLeft: "5px" },
  tableFooter: { padding: "16px 24px", fontSize: "13px", color: "#64748b", borderTop: "1px solid #e2e8f0", background: "#f8fafc", textAlign: "right" },

  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "600px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  closeBtn: { background: "#f1f5f9", border: "none", cursor: "pointer", color: "#64748b", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "flex", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  label: { fontSize: "14px", fontWeight: "600", color: "#334155" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" },
  cancelBtn: { padding: "10px 20px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  
  successBox: { padding: "16px", background: "#dcfce7", color: "#15803d", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "500", border: "1px solid #bbf7d0" },
  errorBox: { padding: "16px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "500", border: "1px solid #fecaca" },
};