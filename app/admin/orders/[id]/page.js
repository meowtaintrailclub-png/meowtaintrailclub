import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../lib/adminSession";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "paid", "failed", "cancelled"];

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kuala_Lumpur",
  });
}

export default async function EditOrder({ params }) {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const supabase = supabaseAdmin();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, runners(name, whatsapp, email), order_items(*)")
    .eq("id", params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-back { display: block; color: #8A8A85; font-size: 13px; text-decoration: none; margin-bottom: 18px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 26px; margin: 0; }
        .mtc-order-date { color: #5A5854; font-size: 13px; margin-top: 8px; font-family: 'JetBrains Mono', monospace; }
        .mtc-body { max-width: 520px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-items-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; margin-bottom: 16px; }
        .mtc-details-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 14px; }
        .mtc-item-line { display: flex; justify-content: space-between; font-size: 13px; color: #B8B4AC; margin-bottom: 8px; }
        .mtc-item-line:last-child { margin-bottom: 0; }
        .mtc-order-total-line { display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #201F1C; }
        .mtc-runner-info { color: #8A8A85; font-size: 13px; margin-bottom: 4px; }
        .mtc-form-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 13px; color: #8A8A85; }
        .mtc-field-input { width: 100%; padding: 10px 12px; margin-bottom: 16px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; }
        .mtc-field-input:focus { outline: none; border-color: #FF5A1F; }
        .mtc-checkbox-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .mtc-checkbox-row input { width: 18px; height: 18px; accent-color: #FF5A1F; }
        .mtc-checkbox-row label { font-size: 14px; color: #F5F1EA; }
        .mtc-btn-primary { display: inline-block; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .mtc-danger-card { margin-top: 16px; background: #1A1210; border: 1px solid #3A2420; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-danger-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; margin: 0 0 6px; color: #E88; }
        .mtc-btn-danger { display: inline-block; padding: 9px 18px; background: transparent; border: 1px solid #B23B22; color: #E07050; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none; }
        .mtc-btn-danger:hover { background: #2A1512; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin/orders" className="mtc-back">&larr; Back to orders</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">{order.runners?.name || "Unknown runner"}</h1>
          <p className="mtc-order-date">{formatDate(order.created_at)}</p>
        </div>

        <div className="mtc-body">
          <div className="mtc-items-card">
            <p className="mtc-details-title">Items</p>
            {order.order_items.map((item) => (
              <div className="mtc-item-line" key={item.id}>
                <span>{item.product_name} ({item.size}) &times;{item.quantity}</span>
                <span>RM {(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mtc-order-total-line">
              <span>Total</span>
              <span>RM {Number(order.total_amount).toFixed(2)}</span>
            </div>
            {order.runners?.whatsapp && <p className="mtc-runner-info" style={{ marginTop: 14 }}>WhatsApp: {order.runners.whatsapp}</p>}
            {order.runners?.email && <p className="mtc-runner-info">Email: {order.runners.email}</p>}
            {order.hitpay_reference && <p className="mtc-runner-info">HitPay Reference: {order.hitpay_reference}</p>}
          </div>

          <form action="/api/admin/orders/update" method="POST" className="mtc-form-card">
            <input type="hidden" name="id" value={order.id} />
            <p className="mtc-details-title">Edit Order</p>

            <label className="mtc-field-label">Status</label>
            <select name="status" defaultValue={order.status} className="mtc-field-input">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            <div className="mtc-checkbox-row">
              <input type="checkbox" name="fulfilled" id="fulfilled" defaultChecked={order.fulfilled} />
              <label htmlFor="fulfilled">Marked as shipped</label>
            </div>

            <label className="mtc-field-label">Shipping Name</label>
            <input type="text" name="shipping_name" defaultValue={order.shipping_name || ""} className="mtc-field-input" />

            <label className="mtc-field-label">Shipping Phone</label>
            <input type="text" name="shipping_phone" defaultValue={order.shipping_phone || ""} className="mtc-field-input" />

            <label className="mtc-field-label">Shipping Address</label>
            <input type="text" name="shipping_address" defaultValue={order.shipping_address || ""} className="mtc-field-input" />

            <button type="submit" className="mtc-btn-primary">Save Changes</button>
          </form>

          <div className="mtc-danger-card">
            <p className="mtc-danger-title">Danger zone</p>
            <p style={{ color: "#8A8A85", fontSize: 13, marginBottom: 14 }}>
              Deleting an order removes it and its line items permanently. This does not refund the payment on HitPay's side.
            </p>
            <a href={`/admin/orders/${order.id}/delete`} className="mtc-btn-danger">Delete this order</a>
          </div>
        </div>
      </div>
    </>
  );
}
