import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Meowtain Trail Club";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/Meowtain-logo.jpeg`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D0D0D",
        }}
      >
        <img
          src={logoUrl}
          width="150"
          height="150"
          style={{ borderRadius: "50%", border: "3px solid #FF5A1F" }}
        />
        <div style={{ marginTop: 32, fontSize: 58, fontWeight: 700, color: "#F5F1EA" }}>
          Meowtain Trail Club
        </div>
        <div style={{ marginTop: 14, fontSize: 26, color: "#8A8A85" }}>
          Chase The Summit — Together
        </div>
      </div>
    ),
    { ...size }
  );
}
