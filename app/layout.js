export const metadata = {
  title: "Meowtain Trail Club",
  description: "Monthly trail running challenge leaderboard",
  icons: {
    icon: "/Meowtain-logo.jpeg",
  },
};

export default function RootLayout({ children }) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0D0D0D" }}>
        {children}
        <footer
          style={{
            textAlign: "center",
            padding: "20px 24px",
            background: "#0D0D0D",
            borderTop: "1px solid #201F1C",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "#5A5854",
          }}
        >
          &copy; {year} Meowtain Trail Club. All rights reserved. &middot;{" "}
          <a href="/legal" style={{ color: "#8A8A85", textDecoration: "underline" }}>
            Privacy &amp; Disclaimer
          </a>
        </footer>
      </body>
    </html>
  );
}
