import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import API from "./api";
import { colors } from "./theme";
import { Plus, Trash2, Download, Save } from "lucide-react";
import logo from "./assets/logo.jpeg";
import { buildInvoicePdf, loadLogo } from "./invoicePdf";

export default function CreateInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoiceNo, setInvoiceNo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([]);
  const [amountPaid, setAmountPaid] = useState(0);

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        API.get("/customers/all"),
        API.get("/products/all"),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);

      if (id) {
        const invRes = await API.get(`/invoices/${id}`);
        const inv = invRes.data;

        setInvoiceNo(inv.invoiceNo);
        setDate(inv.date);
        setSelectedCustomer(inv.customerId);
        setAmountPaid(inv.amountPaid);
        setCustomerSearch(inv.customerName);

        // When editing, we need to attach the maxStock to existing items
        const itemsWithStock = inv.items.map(item => {
           const product = prodRes.data.find(p => p.id === item.productId);
           return {
              ...item,
              // If editing, the stock hasn't been deducted yet (or we consider current stock as max for the edit)
              maxStock: product ? product.stockQty : 9999 
           };
        });
        setItems(itemsWithStock);

      } else {
        const nextNoRes = await API.get("/invoices/next-no");
        setInvoiceNo(nextNoRes.data.invoiceNo);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addProduct = (product) => {
    const existing = items.find((i) => i.productId === product.id);
    
    if (existing) {
      // Check if incrementing will exceed stock
      if (existing.quantity >= product.stockQty) {
        alert(`Cannot add more. Only ${product.stockQty} units of ${product.productName} are in stock.`);
        return;
      }
      setItems(
        items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, total: i.price * (i.quantity + 1) }
            : i
        )
      );
    } else {
      if (product.stockQty <= 0) {
        alert(`Out of stock! Cannot add ${product.productName}.`);
        return;
      }
      setItems([
        ...items,
        {
          productId: product.id,
          productCode: product.productCode,
          productName: product.productName,
          price: product.price,
          quantity: 1,
          total: product.price,
          maxStock: product.stockQty // Save max stock to validate manual typing later
        },
      ]);
    }
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const updateQty = (index, qty) => {
    const newItems = [...items];
    const item = newItems[index];

    // Validate against max stock
    if (qty > item.maxStock) {
      alert(`Only ${item.maxStock} units available in stock.`);
      qty = item.maxStock;
    }

    item.quantity = qty || 0;
    item.total = item.price * item.quantity;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const balance = totalAmount - amountPaid;

  const handleSave = async () => {
    if (!selectedCustomer) return alert("Please select a customer");
    if (items.length === 0) return alert("Please add at least one product");

    const customerObj = customers.find((c) => c.id === selectedCustomer);

    const payload = {
      id: id || null,
      // If it's a new invoice, we don't even need to send invoiceNo, 
      // the backend will generate it. But we'll send it for safety.
      invoiceNo: id ? invoiceNo : null, 
      date,
      customerId: selectedCustomer,
      customerName: customerObj ? customerObj.organizationName : "Unknown",
      items,
      totalAmount,
      amountPaid: parseFloat(amountPaid),
      balance,
    };

    try {
      // Get the saved invoice back from the backend
      const response = await API.post("/invoices/save", payload);
      
      // If it's a new invoice, the backend generated the real number.
      // You can now redirect, and the list page will show the true INV-XXXX.
      navigate("/invoices");
    } catch (err) {
      alert("Error saving invoice");
    }
  };
  const handleDownloadPDF = async () => {
    if (!selectedCustomer) return alert("Please select a customer");
    if (items.length === 0) return alert("Please add at least one product");

    const customerObj = customers.find((c) => c.id === selectedCustomer);
    const logoData = await loadLogo(logo); // logo cropped + converted for the PDF

    const doc = buildInvoicePdf(
      {
        invoiceNo,
        date,
        customer: { name: customerObj?.organizationName, mobile: customerObj?.mobileNumber },
        items,
        total: totalAmount,
        paid: Number(amountPaid) || 0,
        balance,
      },
      logoData
    );
    doc.save(`${invoiceNo}.pdf`);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.organizationName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.mobileNumber.includes(customerSearch)
  );

  const filteredProducts = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.productCode.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <Layout
      title={id ? "Edit Invoice" : "Invoice Generation"}
      subtitle="Select a customer, add products and download a PDF"
    >
      <div style={styles.mainCard}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.cardTitle}>{id ? "Edit Invoice" : "Create Invoice"}</h2>
            <span style={styles.invoicePill}>{invoiceNo}</span>
          </div>
          <div style={styles.invoiceMeta}>
            <label style={{ ...styles.label, margin: 0 }}>Date</label>
            <input type="date" className="sj-input" value={date} onChange={(e) => setDate(e.target.value)} style={styles.dateInput} />
          </div>
        </div>

        <div style={styles.twoCol} className="sj-row2">
          {/* Customer Search */}
          <div style={{ flex: 1, position: "relative" }}>
            <label style={styles.label}>Customer *</label>
            <input
              type="text"
              className="sj-input"
              placeholder="Search customer by name or phone..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              style={styles.input}
            />
            {showCustomerDropdown && customerSearch && (
              <div style={styles.dropdown}>
                {filteredCustomers.length === 0 ? (
                  <div style={styles.dropdownItem}>No customers found</div>
                ) : (
                  filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      className="sj-row"
                      style={styles.dropdownItem}
                      onClick={() => {
                        setSelectedCustomer(c.id);
                        setCustomerSearch(c.organizationName);
                        setShowCustomerDropdown(false);
                      }}
                    >
                      <strong>{c.organizationName}</strong> <span style={{ color: colors.muted }}>({c.mobileNumber})</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Product Search */}
          <div style={{ flex: 1, position: "relative" }}>
            <label style={styles.label}>Add Product</label>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="text"
                  className="sj-input"
                  placeholder="Search product by name or code..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  style={styles.input}
                />
                {showProductDropdown && productSearch && (
                  <div style={styles.dropdown}>
                    {filteredProducts.length === 0 ? (
                      <div style={styles.dropdownItem}>No products found</div>
                    ) : (
                      filteredProducts.map((p) => (
                        <div key={p.id} className="sj-row" style={styles.dropdownItem} onClick={() => addProduct(p)}>
                          <strong>{p.productName}</strong> <span style={{ color: colors.muted }}>({p.productCode})</span> - ₹{p.price}{" "}
                          <span style={{ color: colors.muted }}>(Stock: {p.stockQty})</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button className="sj-btn-primary" style={styles.addBtn} onClick={() => setShowProductDropdown(true)}>
                <Plus size={18} /> Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ overflowX: "auto", marginTop: 24 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 50 }}>#</th>
                <th style={styles.th}>Product</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Price (₹)</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Quantity</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Total (₹)</th>
                <th style={{ ...styles.th, width: 56 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan="6" style={styles.empty}>No products added yet. Search above to add items.</td>
                </tr>
              )}
              {items.map((item, index) => (
                <tr key={index} className="sj-row" style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: colors.ink }}>
                    {item.productName} <span style={{ color: colors.muted, fontWeight: 400 }}>({item.productCode})</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>{item.price.toFixed(2)}</td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <input
                      type="number"
                      min="1"
                      max={item.maxStock} 
                      className="sj-input"
                      value={item.quantity}
                      onChange={(e) => updateQty(index, parseInt(e.target.value))}
                      style={styles.qtyInput}
                    />
                  </td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: colors.ink }}>{item.total.toFixed(2)}</td>
                  <td style={styles.td}>
                    <button onClick={() => removeItem(index)} style={styles.deleteBtn} title="Remove">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={styles.totalsSection}>
          <div style={styles.totalsRow}>
            <span>Total Amount</span>
            <strong style={{ color: colors.ink }}>₹{totalAmount.toFixed(2)}</strong>
          </div>
          <div style={styles.totalsRow}>
            <span>Amount Paid</span>
            <input
              type="number"
              className="sj-input"
              value={amountPaid}
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              style={styles.paidInput}
            />
          </div>
          <div style={styles.balanceRow}>
            <span>Balance Due</span>
            <span>₹{balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.footerActions}>
          <button onClick={() => navigate("/invoices")} className="sj-btn-ghost" style={styles.cancelBtn}>Cancel</button>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={handleDownloadPDF} className="sj-btn-ghost" style={styles.pdfBtn}>
              <Download size={18} /> Download PDF
            </button>
            <button onClick={handleSave} className="sj-btn-primary" style={styles.saveBtn}>
              <Save size={18} /> Save Invoice
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  mainCard: { background: "#fff", borderRadius: 14, border: `1px solid ${colors.border}`, padding: 32 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 },
  cardTitle: { fontSize: 22, fontWeight: 800, color: colors.ink, marginBottom: 8 },
  invoicePill: { background: colors.orangeSoft, color: "#9a3412", padding: "5px 12px", borderRadius: 999, fontSize: 13, fontWeight: 700 },
  invoiceMeta: { display: "flex", alignItems: "center", gap: 12 },
  dateInput: { padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", outline: "none", fontFamily: "inherit", fontSize: 14, background: "#f8fafc" },
  twoCol: { display: "flex", gap: 20, flexWrap: "wrap" },
  label: { display: "block", fontSize: 13.5, fontWeight: 600, color: colors.text, marginBottom: 8 },
  input: { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", background: "#f8fafc", fontFamily: "inherit" },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 10, zIndex: 10, maxHeight: 220, overflowY: "auto", boxShadow: "0 12px 24px rgba(15,23,42,.12)" },
  dropdownItem: { padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: 14 },
  addBtn: { display: "flex", alignItems: "center", gap: 8, padding: "0 20px", background: colors.orange, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "13px 16px", background: "#f8fafc", borderBottom: `1px solid ${colors.border}`, fontSize: 11.5, fontWeight: 700, color: colors.muted, textTransform: "uppercase", letterSpacing: "0.6px" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", fontSize: 14, color: colors.text, borderBottom: "1px solid #f1f5f9" },
  empty: { textAlign: "center", padding: "36px 16px", color: colors.muted, fontSize: 14 },
  qtyInput: { width: 80, padding: 8, borderRadius: 8, border: "1px solid #cbd5e1", textAlign: "center", fontFamily: "inherit", background: "#f8fafc" },
  deleteBtn: { background: "#fee2e2", color: "#ef4444", border: "none", width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },

  totalsSection: { width: 320, maxWidth: "100%", marginLeft: "auto", marginTop: 24, display: "flex", flexDirection: "column", gap: 14 },
  totalsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15, color: colors.muted },
  paidInput: { width: 130, padding: 9, borderRadius: 8, border: "1px solid #cbd5e1", textAlign: "right", fontSize: 15, fontFamily: "inherit", background: "#f8fafc" },
  balanceRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: colors.orange, color: "#fff", padding: "14px 16px", borderRadius: 10, fontSize: 17, fontWeight: 800 },

  footerActions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, paddingTop: 22, borderTop: `1px solid ${colors.border}`, flexWrap: "wrap", gap: 12 },
  cancelBtn: { padding: "12px 24px", background: "#fff", color: colors.text, border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  pdfBtn: { display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "#fff", color: colors.ink, border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: colors.orange, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};