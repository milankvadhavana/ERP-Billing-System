export default function Logo({ darkTheme = false }) {
  const textColor = darkTheme ? "#ffffff" : "#1e293b";
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10C50 10 30 20 20 40C10 60 20 80 20 80C20 80 40 70 50 50C60 70 80 80 80 80C80 80 90 60 80 40C70 20 50 10 50 10Z" fill="#f97316"/>
          <path d="M50 20C50 20 35 30 30 45C25 60 30 70 30 70C30 70 45 60 50 45C55 60 70 70 70 70C70 70 75 60 70 45C65 30 50 20 50 20Z" fill="#ea580c"/>
        </svg>
        <span style={{ fontSize: '32px', fontWeight: '900', color: textColor, letterSpacing: '1px', marginLeft: '-4px' }}>
          SHREEJI
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', width: '100%', justifyContent: 'center' }}>
        <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${textColor}`, opacity: 0.3 }} />
        <span style={{ fontSize: '12px', fontWeight: '700', color: textColor, letterSpacing: '3px' }}>ORANGE DECORE</span>
        <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${textColor}`, opacity: 0.3 }} />
      </div>
      <p style={{ fontSize: '9px', color: textColor, opacity: 0.7, letterSpacing: '4px', marginTop: '5px', fontWeight: '500' }}>
        THE WORLD OF QUALITY
      </p>
    </div>
  );
}