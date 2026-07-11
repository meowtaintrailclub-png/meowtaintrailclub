export const metadata = {
  title: "Meowtain Trail Club",
  description: "Connect your Strava, log every trail run, and climb this month's leaderboard.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://meowtaintrailclub.vercel.app"),
  icons: {
    icon: "/Meowtain-logo.jpeg",
  },
  openGraph: {
    title: "Meowtain Trail Club",
    description: "Connect your Strava, log every trail run, and climb this month's leaderboard.",
    url: "/",
    siteName: "Meowtain Trail Club",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meowtain Trail Club",
    description: "Connect your Strava, log every trail run, and climb this month's leaderboard.",
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
          </a>{" "}
          &middot;{" "}
          <a href="mailto:meowtaintrailclub@gmail.com" style={{ color: "#8A8A85", textDecoration: "underline" }}>
            meowtaintrailclub@gmail.com
          </a>
        </footer>
      </body>
    </html>
  );
}
