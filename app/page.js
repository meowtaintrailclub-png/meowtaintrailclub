export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-landing { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .mtc-landing-inner { max-width: 380px; text-align: center; }
        .mtc-landing-logo { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 1px solid #2A2A2A; margin-bottom: 24px; }
        .mtc-landing-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 10px; }
        .mtc-landing-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 34px; margin: 0 0 14px; letter-spacing: -0.01em; }
        .mtc-landing-sub { color: #8A8A85; font-size: 15px; line-height: 1.6; margin: 0 0 32px; }
        .mtc-landing-btn { display: inline-flex; align-items: center; gap: 10px; padding: 14px 28px; background: #FF5A1F; color: #0D0D0D; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; transition: opacity 0.15s ease; }
        .mtc-landing-btn:hover { opacity: 0.88; }
      `}</style>

      <main className="mtc-landing">
        <div className="mtc-landing-inner">
          <img src="/Meowtain-logo.jpeg" alt="Meowtain Trail Club" className="mtc-landing-logo" />
          <p className="mtc-landing-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-landing-title">Monthly Challenge</h1>
          <p className="mtc-landing-sub">
            Connect your Strava account to join this month's challenge and track your distance, elevation, and time on the board.
          </p>
          <a href="/api/auth/strava" className="mtc-landing-btn">
            Connect with Strava
          </a>
        </div>
      </main>
    </>
  );
}
