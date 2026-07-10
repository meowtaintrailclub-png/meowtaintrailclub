export const metadata = {
  title: "Go-Tribe",
  description: "Monthly running challenge leaderboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
