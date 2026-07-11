export const metadata = {
  title: "Meowtain Trail Club",
  description: "Monthly trail running challenge leaderboard",
  icons: {
    icon: "/Meowtain-logo.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
