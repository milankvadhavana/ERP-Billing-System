import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------
   EDIT YOUR BUSINESS DETAILS HERE. Empty values are simply not printed.
------------------------------------------------------------------- */
export const COMPANY = {
  name: "Shreeji Orange Decore",
  tagline: "The World of Quality",
  address: "", // e.g. "Shop No. 12, Main Road, Pune - 411001"
  phone: "",   // e.g. "+91 98765 43210"
  email: "",   // e.g. "info@shreeji.com"
  gstin: "",   // e.g. "27ABCDE1234F1Z5"
};

const ORANGE = [249, 115, 22];
const DARK = [15, 23, 42];
const TEXT = [51, 65, 85];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];
const CREAM = [252, 246, 234]; // same cream as the logo background

/* ----------------------------- helpers ----------------------------- */
const money = (n) =>
  "Rs. " + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).split("-");
  return y && m && day ? `${day}-${m}-${y}` : d;
};

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const below100 = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : ""));
const below1000 = (n) => {
  const h = Math.floor(n / 100), r = n % 100;
  return (h ? ONES[h] + " Hundred" + (r ? " " : "") : "") + (r ? below100(r) : "");
};
const toWords = (n) => {
  if (n === 0) return "Zero";
  const parts = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) parts.push(below100(crore) + " Crore");
  if (lakh) parts.push(below100(lakh) + " Lakh");
  if (thousand) parts.push(below100(thousand) + " Thousand");
  if (n) parts.push(below1000(n));
  return parts.join(" ");
};

export function amountInWords(amount) {
  const value = Math.max(0, Number(amount) || 0);
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  let out = "Rupees " + toWords(rupees);
  if (paise) out += " and " + below100(paise) + " Paise";
  return out + " Only";
}

/**
 * Loads the logo and crops the empty cream margin around the artwork, so it
 * can be placed in the PDF header without extra blank space.
 * Returns { dataUrl, ratio } or null if the image can't be loaded.
 */
export function loadLogo(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const sx = img.naturalWidth * 0.02;
      const sy = img.naturalHeight * 0.14;
      const sw = img.naturalWidth * 0.96;
      const sh = img.naturalHeight * 0.72;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.92), ratio: canvas.width / canvas.height });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* --------------------------- PDF builder --------------------------- */
/**
 * data = { invoiceNo, date, customer: { name, mobile }, items: [...], total, paid, balance }
 * logo = result of loadLogo() (or null)
 */
export function buildInvoicePdf(data, logo) {
  const { invoiceNo, date, customer, items, total, paid, balance } = data;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 14, R = W - M;

  /* ---- Header band ---- */
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, W, 42, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(0, 42, W, 2.5, "F");

  if (logo) {
    const h = 30;
    doc.addImage(logo.dataUrl, "JPEG", M, 6, h * logo.ratio, h);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...DARK);
    doc.text(COMPANY.name, M, 22);
    doc.setFontSize(9);
    doc.setTextColor(...ORANGE);
    doc.text(COMPANY.tagline.toUpperCase(), M, 28);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...DARK);
  doc.text("INVOICE", R, 19, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(`No. ${invoiceNo}`, R, 26, { align: "right" });

  const contact = [
    COMPANY.address,
    [COMPANY.phone, COMPANY.email].filter(Boolean).join("  |  "),
    COMPANY.gstin ? `GSTIN: ${COMPANY.gstin}` : "",
  ].filter(Boolean);
  doc.setFontSize(8);
  contact.forEach((line, i) => doc.text(line, R, 32 + i * 3.6, { align: "right" }));

  /* ---- Billed to + invoice details ---- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text("BILLED TO", M, 56);

  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text(customer?.name || "N/A", M, 63);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Mobile: ${customer?.mobile || "N/A"}`, M, 69.5);

  let statusText = "UNPAID", statusColor = [220, 38, 38];
  if (total > 0 && balance <= 0) { statusText = "PAID"; statusColor = [22, 163, 74]; }
  else if (paid > 0) { statusText = "PARTIALLY PAID"; statusColor = [217, 119, 6]; }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...LINE);
  doc.roundedRect(118, 50, 78, 26, 2, 2, "FD");

  const rows = [
    ["Invoice No", invoiceNo, DARK],
    ["Date", fmtDate(date), DARK],
    ["Status", statusText, statusColor],
  ];
  rows.forEach(([label, value, color], i) => {
    const y = 58 + i * 6.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(label, 122, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(String(value), R - 4, y, { align: "right" });
  });

  /* ---- Items table ---- */
  autoTable(doc, {
    startY: 86,
    margin: { left: M, right: M, top: 18, bottom: 30 },
    head: [[
      { content: "#", styles: { halign: "center" } },
      { content: "Product", styles: { halign: "left" } },
      { content: "Price", styles: { halign: "right" } },
      { content: "Qty", styles: { halign: "center" } },
      { content: "Total", styles: { halign: "right" } },
    ]],
    body: items.map((it, i) => [
      i + 1,
      `${it.productName}${it.productCode ? `  (${it.productCode})` : ""}`,
      money(it.price),
      String(it.quantity),
      money(it.total),
    ]),
    theme: "plain",
    styles: { font: "helvetica", fontSize: 10, cellPadding: { top: 3.4, bottom: 3.4, left: 3, right: 3 }, textColor: TEXT },
    headStyles: { fillColor: DARK, textColor: 255, fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 36, halign: "right" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 38, halign: "right" },
    },
    didDrawCell: (d) => {
      if (d.section === "body") {
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.2);
        doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
      }
    },
  });

  /* ---- Totals, amount in words, signature ---- */
  let y = doc.lastAutoTable.finalY + 10;
  if (y > 297 - 30 - 72) { // not enough room, move to a new page
    doc.addPage();
    y = 22;
  }

  // Left: amount in words
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text("AMOUNT IN WORDS", M, y + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT);
  doc.text(doc.splitTextToSize(amountInWords(total), 92), M, y + 9);

  // Right: totals
  const labelX = 122;
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text("Subtotal", labelX, y + 3);
  doc.text("Amount Paid", labelX, y + 10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(money(total), R, y + 3, { align: "right" });
  doc.text(money(paid), R, y + 10, { align: "right" });

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(118, y + 14, R, y + 14);

  doc.setFillColor(...ORANGE);
  doc.roundedRect(118, y + 18, 78, 13, 2, 2, "F");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Balance Due", 122, y + 26.3);
  doc.text(money(balance), R - 4, y + 26.3, { align: "right" });

  // Signature
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text(`For ${COMPANY.name}`, R, y + 46, { align: "right" });
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.3);
  doc.line(R - 52, y + 62, R, y + 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Authorised Signatory", R, y + 67, { align: "right" });

  /* ---- Footer on every page ---- */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.6);
    doc.line(M, 284, R, 284);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${COMPANY.name}  -  ${COMPANY.tagline}`, M, 289);
    doc.text("Thank you for your business!", W / 2 + 14, 289, { align: "center" });
    doc.text(`Page ${p} of ${pages}`, R, 289, { align: "right" });
  }

  return doc;
}