// Shared colours + global CSS (hover / focus / responsive rules)
export const colors = {
  orange: "#f97316",
  orangeDark: "#ea580c",
  orangeSoft: "#fff7ed",
  ink: "#0f172a",
  inkSoft: "#1e293b",
  text: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f5f7fa",
  cream: "#fcf6ea", // same cream as the logo background
};

export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      * { box-sizing: border-box; }
      html, body, #root { margin: 0; padding: 0; }
      body { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif; color: ${colors.text}; background: ${colors.bg}; -webkit-font-smoothing: antialiased; }
      h1, h2, h3, h4, p { margin: 0; }

      .sj-input { transition: border-color .15s, box-shadow .15s, background .15s; }
      .sj-input:focus { border-color: ${colors.orange} !important; box-shadow: 0 0 0 4px rgba(249,115,22,.14); background: #fff !important; }
      .sj-btn-primary { transition: background .15s, transform .05s, box-shadow .15s; }
      .sj-btn-primary:hover { background: ${colors.orangeDark} !important; box-shadow: 0 6px 16px rgba(249,115,22,.35); }
      .sj-btn-primary:active { transform: translateY(1px); }
      .sj-btn-primary:disabled { opacity: .7; cursor: not-allowed; }
      .sj-btn-ghost { transition: background .15s, border-color .15s; }
      .sj-btn-ghost:hover { background: #f8fafc !important; border-color: #94a3b8 !important; }
      .sj-nav { transition: background .15s, color .15s; }
      .sj-nav:hover { background: rgba(255,255,255,.07); color: #fff !important; }
      .sj-row { transition: background .12s; }
      .sj-row:hover { background: #fafbfc; }
      .sj-icon-btn { transition: background .15s; }
      .sj-icon-btn:hover { background: #f1f5f9 !important; }
      .sj-stat { transition: transform .15s, box-shadow .15s; }
      .sj-stat:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15,23,42,.08); }

      @media (max-width: 1000px) {
        .sj-auth-left { display: none !important; }
        .sj-stats { grid-template-columns: repeat(2, 1fr) !important; }
        .sj-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 760px) {
        .sj-sidebar { display: none !important; }
        .sj-content { padding: 20px !important; }
        .sj-header { padding: 0 20px !important; }
        .sj-date { display: none !important; }
        .sj-stats { grid-template-columns: 1fr !important; }
        .sj-row2 { flex-direction: column !important; }
      }
    `}</style>
  );
}
