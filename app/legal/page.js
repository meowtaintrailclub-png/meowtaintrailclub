export default function Legal() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&display=swap');
        .mtc-legal { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding: 50px 24px; }
        .mtc-legal-inner { max-width: 620px; margin: 0 auto; }
        .mtc-legal-back { display: inline-block; color: #8A8A85; text-decoration: none; font-size: 13px; margin-bottom: 24px; }
        .mtc-legal-back:hover { color: #F5F1EA; }
        .mtc-legal-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 28px; margin: 0 0 8px; }
        .mtc-legal-updated { color: #5A5854; font-size: 13px; margin: 0 0 36px; }
        .mtc-legal h2 { font-size: 17px; margin: 32px 0 10px; }
        .mtc-legal p { color: #B8B4AC; font-size: 14px; line-height: 1.7; margin: 0 0 12px; }
        .mtc-legal a.inline { color: #FF5A1F; text-decoration: none; }
        .mtc-legal a.inline:hover { text-decoration: underline; }
      `}</style>

      <main className="mtc-legal">
        <div className="mtc-legal-inner">
          <a href="/" className="mtc-legal-back">&larr; Back home</a>
          <h1 className="mtc-legal-title">Privacy &amp; Disclaimer</h1>
          <p className="mtc-legal-updated">Last updated {year}</p>

          <h2>Assumption of risk</h2>
          <p>
            Trail running and outdoor activity carry inherent risks, including but not limited to
            injury, adverse weather, and difficult terrain. By participating in Meowtain Trail
            Club challenges and any related activities, you acknowledge these risks and
            participate entirely at your own risk. Meowtain Trail Club, its organizers, and
            admins accept no liability for any injury, loss, or damage arising from your
            participation.
          </p>

          <h2>What we collect</h2>
          <p>
            When you connect your Strava account, we store your name, profile photo, and activity
            data (distance, elevation gain, and time) for runs logged from the day you join
            onward. If you choose to provide them, we also store your WhatsApp number, email
            address, home address, and date of birth.
          </p>

          <h2>Why we collect it</h2>
          <p>
            This information is used to run the monthly leaderboard and challenge, contact you
            about club updates, and coordinate prize distribution for challenge winners. We do
            not sell or share your information with third parties.
          </p>

          <h2>Your data, your control</h2>
          <p>
            You can update your WhatsApp, email, address, and date of birth at any time from your
            profile page. To request full removal of your data from Meowtain Trail Club, contact
            us at{" "}
            <a href="mailto:meowtaintrailclub@gmail.com" className="inline">
              meowtaintrailclub@gmail.com
            </a>.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about the club, this website, or your data can be sent to{" "}
            <a href="mailto:meowtaintrailclub@gmail.com" className="inline">
              meowtaintrailclub@gmail.com
            </a>.
          </p>
        </div>
      </main>
    </>
  );
}
