export const metadata = {
  title: "Meowtain Trail Club",
  description: "Monthly trail running challenge leaderboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
