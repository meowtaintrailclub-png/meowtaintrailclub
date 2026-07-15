"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0D0D0D" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "Arial, sans-serif",
            color: "#F5F1EA",
          }}
        >
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ color: "#8A8A85", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "10px 22px",
                background: "#FF5A1F",
                color: "#0D0D0D",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
