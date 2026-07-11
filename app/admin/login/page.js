export const dynamic = "force-dynamic";

export default function AdminLogin({ searchParams }) {
  const hasError = searchParams?.error === "1";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-login { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .mtc-login-card { max-width: 340px; width: 100%; background: #141311; border: 1px solid #201F1C; border-radius: 12px; padding: 32px; text-align: center; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-login-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 26px; margin: 0 0 20px; }
        .mtc-login-error { color: #FF5A1F; font-size: 13px; margin-bottom: 16px; }
        .mtc-field-input { width: 100%; padding: 10px 12px; margin-bottom: 16px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; }
        .mtc-field-input:focus { outline: none; border-color: #FF5A1F; }
        .mtc-btn-primary { width: 100%; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
      `}</style>

      <main className="mtc-login">
        <div className="mtc-login-card">
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-login-title">Admin</h1>
          {hasError && <p className="mtc-login-error">Wrong password. Try again.</p>}
          <form action="/api/admin/login" method="POST">
            <input type="password" name="password" placeholder="Admin password" className="mtc-field-input" />
            <button type="submit" className="mtc-btn-primary">Log in</button>
          </form>
        </div>
      </main>
    </>
  );
}
