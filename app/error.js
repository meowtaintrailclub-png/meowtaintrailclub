"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&display=swap');
        .mtc-error-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .mtc-error-card { max-width: 420px; width: 100%; text-align: center; }
        .mtc-error-icon { width: 56px; height: 56px; margin: 0 auto 20px; }
        .mtc-error-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; margin: 0 0 12px; }
        .mtc-error-text { color: #8A8A85; font-size: 14px; line-height: 1.6; margin: 0 0 28px; }
        .mtc-error-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .mtc-btn-primary { padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .mtc-btn-ghost { padding: 10px 22px; background: transparent; border: 1px solid #2A2A2A; color: #F5F1EA; border-radius: 6px; font-weight: 600; font-size: 14px; text-decoration: none; }
      `}</style>

      <main className="mtc-error-page">
        <div className="mtc-error-card">
          <svg className="mtc-error-icon" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="1.5">
            <path d="M3 20L9 8L12 14L15 9L21 20H3Z" strokeLinejoin="round" />
          </svg>
          <h1 className="mtc-error-title">Something went wrong</h1>
          <p className="mtc-error-text">
            This wasn't your fault — an unexpected error occurred. Try again, or head back to the homepage.
          </p>
          <div className="mtc-error-actions">
            <button onClick={() => reset()} className="mtc-btn-primary">Try Again</button>
            <a href="/" className="mtc-btn-ghost">Back Home</a>
          </div>
        </div>
      </main>
    </>
  );
}
