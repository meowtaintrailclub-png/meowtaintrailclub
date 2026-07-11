export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
        .mtc-404 { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; }
        .mtc-404-inner { max-width: 380px; }
        .mtc-404-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 12px; }
        .mtc-404-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 30px; margin: 0 0 12px; }
        .mtc-404-sub { color: #8A8A85; font-size: 14px; line-height: 1.6; margin: 0 0 28px; }
        .mtc-404-btn { display: inline-block; padding: 12px 26px; background: #FF5A1F; color: #0D0D0D; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
      `}</style>

      <main className="mtc-404">
        <div className="mtc-404-inner">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 20 }}>
            <path d="M2 24L11 9L16 17L20 11L30 24H2Z" stroke="#FF5A1F" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="11" cy="6" r="1.6" fill="#FF5A1F" />
          </svg>
          <p className="mtc-404-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-404-title">Trail Not Found</h1>
          <p className="mtc-404-sub">This path doesn't lead anywhere. Let's get you back on route.</p>
          <a href="/" className="mtc-404-btn">Back to base camp</a>
        </div>
      </main>
    </>
  );
}
