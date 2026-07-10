export default function Home() {
  return (
    <main style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>Go-Tribe Monthly Challenge</h1>
      <p>Connect your Strava account to join this month's leaderboard.</p>
      <a
        href="/api/auth/strava"
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "12px 24px",
          background: "#fc4c02",
          color: "white",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Connect with Strava
      </a>
      <p style={{ marginTop: 32 }}>
        <a href="/leaderboard">View current leaderboard →</a>
      </p>
    </main>
  );
}
