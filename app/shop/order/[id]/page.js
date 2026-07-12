import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase";
import { getLoggedInRunnerId } from "../../../../lib/session";

export const dynamic = "force-dynamic";

function statusLabel(status) {
  if (status === "paid") return { text: "Payment Successful", color: "#5CA36E" };
  if (status === "failed") return { text: "Payment Failed", color: "#E07050" };
  return { text: "Processing Payment...", color: "#8A8A85" };
}

export default async function OrderConfirmation({ params }) {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const supabase = supabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", params.id)
    .eq("runner_id", runnerId)
    .single();

  if (!order) {
    notFound();
  }

  const status = statusLabel(order.status);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .mtc-card { max-width: 440px; width: 100%; background: #141311; border: 1px solid #201F1C; border-radius: 12px; padding: 32px; text-align: center; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; margin: 0 0 6px; }
        .mtc-order-total { font-family: 'JetBrains Mono', monospace; font-size: 20px; color: #F5F1EA; margin: 0 0 20px; }
        .mtc-items-list { text-align: left; border-top: 1px solid #201F1C; padding-top: 16px; margin-bottom: 20px; }
        .mtc-item-line { display: flex; justify-content: space-between; font-size: 13px; color: #B8B4AC; margin-bottom: 8px; }
        .mtc-hint { color: #8A8A85; font-size: 13px; margin-bottom: 20px; }
        .mtc-btn-primary { display: inline-block; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
      `}</style>

      <main className="mtc-page">
        <div className="mtc-card">
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title" style={{ color: status.color }}>{status.text}</h1>
          <p className="mtc-order-total">RM {Number(order.total_amount).toFixed(2)}</p>

          <div className="mtc-items-list">
            {order.order_items.map((item) => (
              <div className="mtc-item-line" key={item.id}>
                <span>{item.product_name} ({item.size}) &times;{item.quantity}</span>
                <span>RM {(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.status === "pending" && (
            <p className="mtc-hint">
              If you've just completed payment, this page will update shortly. Refresh if needed.
            </p>
          )}

          <a href="/shop" className="mtc-btn-primary">Back to Shop</a>
        </div>
      </main>
    </>
  );
}
