export const metadata = {
  title: "Install the App · Meowtain Trail Club",
  description: "Add Meowtain Trail Club to your phone's home screen.",
};

export default function InstallPage() {
  const siteUrl = "https://meowtaintrailclub.vercel.app";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=0D0D0D&color=FF5A1F&qzone=2&data=${encodeURIComponent(siteUrl)}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-install { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding: 50px 24px 60px; }
        .mtc-install-inner { max-width: 640px; margin: 0 auto; }
        .mtc-back { display: inline-block; color: #8A8A85; text-decoration: none; font-size: 13px; margin-bottom: 24px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 32px; margin: 0 0 8px; }
        .mtc-lede { color: #B8B4AC; font-size: 15px; line-height: 1.6; margin: 0 0 36px; }
        .mtc-qr-card { background: #141311; border: 1px solid #201F1C; border-radius: 14px; padding: 28px; text-align: center; margin-bottom: 36px; }
        .mtc-qr-card img { border-radius: 8px; margin-bottom: 14px; max-width: 220px; width: 100%; height: auto; }
        .mtc-qr-caption { color: #8A8A85; font-size: 13px; margin: 0; }
        .mtc-qr-caption a { color: #FF5A1F; text-decoration: none; font-weight: 600; }
        .mtc-steps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .mtc-platform-card { background: #141311; border: 1px solid #201F1C; border-radius: 12px; padding: 22px; }
        .mtc-platform-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; margin: 0 0 16px; color: #FF5A1F; }
        .mtc-step { display: flex; gap: 12px; margin-bottom: 14px; align-items: flex-start; }
        .mtc-step:last-child { margin-bottom: 0; }
        .mtc-step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: #201F1C; color: #F5F1EA; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
        .mtc-step-text { font-size: 14px; color: #E8E4DC; line-height: 1.5; padding-top: 1px; }
        .mtc-step-text strong { color: #F5F1EA; }
        .mtc-note { color: #5A5854; font-size: 13px; line-height: 1.6; text-align: center; margin-top: 24px; }
        @media (max-width: 560px) {
          .mtc-steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="mtc-install">
        <div className="mtc-install-inner">
          <a href="/" className="mtc-back">&larr; Back home</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Install the App</h1>
          <p className="mtc-lede">
            Get Meowtain Trail Club on your home screen — opens fullscreen, no browser bar,
            just like any other app.
          </p>

          <div className="mtc-qr-card">
            <img src={qrSrc} alt="QR code linking to Meowtain Trail Club" />
            <p className="mtc-qr-caption">
              Scan with your phone's camera, or visit{" "}
              <a href={siteUrl}>meowtaintrailclub.vercel.app</a>
            </p>
          </div>

          <div className="mtc-steps-grid">
            <div className="mtc-platform-card">
              <p className="mtc-platform-title">iPhone (Safari)</p>
              <div className="mtc-step">
                <div className="mtc-step-num">1</div>
                <div className="mtc-step-text">Open the site in <strong>Safari</strong> (must be Safari, not Chrome)</div>
              </div>
              <div className="mtc-step">
                <div className="mtc-step-num">2</div>
                <div className="mtc-step-text">Tap the <strong>Share</strong> icon (square with an arrow) at the bottom</div>
              </div>
              <div className="mtc-step">
                <div className="mtc-step-num">3</div>
                <div className="mtc-step-text">Scroll down and tap <strong>Add to Home Screen</strong></div>
              </div>
              <div className="mtc-step">
                <div className="mtc-step-num">4</div>
                <div className="mtc-step-text">Tap <strong>Add</strong> in the top right</div>
              </div>
            </div>

            <div className="mtc-platform-card">
              <p className="mtc-platform-title">Android (Chrome)</p>
              <div className="mtc-step">
                <div className="mtc-step-num">1</div>
                <div className="mtc-step-text">Open the site in <strong>Chrome</strong></div>
              </div>
              <div className="mtc-step">
                <div className="mtc-step-num">2</div>
                <div className="mtc-step-text">Look for an <strong>Install app</strong> banner, or tap the <strong>⋮</strong> menu (top right)</div>
              </div>
              <div className="mtc-step">
                <div className="mtc-step-num">3</div>
                <div className="mtc-step-text">Tap <strong>Install app</strong> (or "Add to Home screen")</div>
              </div>
              <div className="mtc-step">
                <div className="mtc-step-num">4</div>
                <div className="mtc-step-text">Confirm by tapping <strong>Install</strong></div>
              </div>
            </div>
          </div>

          <p className="mtc-note">
            This installs the same website as an app icon — no App Store or Play Store needed,
            and it always stays up to date automatically.
          </p>
        </div>
      </main>
    </>
  );
}
