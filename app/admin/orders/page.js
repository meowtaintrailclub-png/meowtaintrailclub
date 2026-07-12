import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { isAdminLoggedIn } from "../../../lib/adminSession";

export const dynamic = "force-dynamic";

function statusBadge(status) {
  if (status === "paid") return { label: "Paid", color: "#5CA36E" };
  if (status === "failed") return { label: "Failed", color: "#E07050" };
  return { label: "Pending", color: "#8A8A85" };
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getOrders() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*, runners(name, whatsapp), order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default async function OrdersAdmin() {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const orders = await getOrders();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-back { display: block; color: #8A8A85; font-size: 13px; text-decoration: none; margin-bottom: 18px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 30px; margin: 0; }
        .mtc-count { color: #8A8A85; font-size: 13px; margin-top: 6px; }
        .mtc-body { max-width: 720px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-empty-text { color: #5A5854; font-size: 14px; font-style: italic; text-align: center; margin-top: 40px; }
        .mtc-order-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; margin-bottom: 14px; text-align: left; }
        .mtc-order-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .mtc-order-runner { font-weight: 600; font-size: 15px; margin: 0 0 4px; }
        .mtc-order-date { color: #5A5854; font-size: 12px; margin: 0; }
        .mtc-order-total { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 16px; color: #F5F1EA; }
        .mtc-status-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; margin-top: 6px; }
        .mtc-items-list { border-top: 1px solid #201F1C; border-bottom: 1px solid #201F1C; padding: 12px 0; margin-bottom: 12px; }
        .mtc-item-line { display: flex; justify-content: space-between; font-size: 13px; color: #B8B4AC; margin-bottom: 6px; }
        .mtc-item-line:last-child { margin-bottom: 0; }
        .mtc-ship-info { font-size: 13px; color: #B8B4AC; line-height: 1.6; margin-bottom: 14px; }
        .mtc-ship-info strong { color: #F5F1EA; }
        .mtc-btn-fulfill { padding: 8px 16px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
        .mtc-fulfilled-badge { display: inline-block; font-size: 12px; font-weight: 600; color: #5CA36E; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin" className="mtc-back">&larr; Back to members</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Orders</h1>
          <p className="mtc-count">{orders.length} total</p>
        </div>

        <div className="mtc-body">
          {orders.length === 0 ? (
            <p className="mtc-empty-text">No orders yet.</p>
          ) : (
            orders.map((order) => {
              const badge = statusBadge(order.status);
              return (
                <div className="mtc-order-card" key={order.id}>
                  <div className="mtc-order-top">
                    <div>
                      <p className="mtc-order-runner">{order.runners?.name || "Unknown runner"}</p>
                      <p className="mtc-order-date">{formatDate(order.created_at)}</p>
                      <span className="mtc-status-badge" style={{ background: `${badge.color}22`, color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mtc-order-total">RM {Number(order.total_amount).toFixed(2)}</div>
                  </div>

                  <div className="mtc-items-list">
                    {order.order_items.map((item) => (
                      <div className="mtc-item-line" key={item.id}>
                        <span>{item.product_name} ({item.size}) &times;{item.quantity}</span>
                        <span>RM {(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mtc-ship-info">
                    <div><strong>Ship to:</strong> {order.shipping_name}</div>
                    <div><strong>Phone:</strong> {order.shipping_phone}</div>
                    <div><strong>Address:</strong> {order.shipping_address}</div>
                  </div>

                  {order.status === "paid" && (
                    order.fulfilled ? (
                      <span className="mtc-fulfilled-badge">&#10003; Shipped</span>
                    ) : (
                      <form action="/api/admin/orders/fulfill" method="POST">
                        <input type="hidden" name="id" value={order.id} />
                        <button type="submit" className="mtc-btn-fulfill">Mark as Shipped</button>
                      </form>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
