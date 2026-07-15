import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { getLoggedInRunnerId } from "../../lib/session";
import { getCart } from "../../lib/cart";

export const dynamic = "force-dynamic";

export default async function Cart({ searchParams }) {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const stockError = searchParams?.error === "stock";
  const stockErrorProduct = searchParams?.product;
  const stockErrorAvailable = searchParams?.available;

  const cart = getCart();
  const supabase = supabaseAdmin();

  const { data: runner } = await supabase
    .from("runners")
    .select("name, whatsapp, address")
    .eq("id", runnerId)
    .single();

  let items = [];
  let total = 0;

  if (cart.length > 0) {
    const productIds = [...new Set(cart.map((item) => item.product_id))];
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price, image_url")
      .in("id", productIds);

    const productMap = {};
    for (const p of products || []) productMap[p.id] = p;

    const variantIds = cart.map((item) => item.variant_id).filter(Boolean);
    let variantMap = {};
    if (variantIds.length > 0) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id, size, color, stock_quantity")
        .in("id", variantIds);
      for (const v of variants || []) variantMap[v.id] = v;
    }

    items = cart
      .map((item) => {
        const product = productMap[item.product_id];
        if (!product) return null;
        const variant = item.variant_id ? variantMap[item.variant_id] : null;
        const lineTotal = Number(product.price) * item.quantity;
        total += lineTotal;
        return { ...item, product, variant, lineTotal };
      })
      .filter(Boolean);
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
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 32px; margin: 0; }
        .mtc-body { max-width: 560px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-empty { padding: 40px 24px; background: #141311; border: 1px solid #201F1C; border-radius: 10px; text-align: center; color: #8A8A85; }
        .mtc-items { display: flex; flex-direction: column; gap: 12px; }
        .mtc-item { display: flex; align-items: center; gap: 14px; background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 14px; }
        .mtc-item-img { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
        .mtc-item-name { font-weight: 600; font-size: 14px; margin: 0; }
        .mtc-item-meta { color: #8A8A85; font-size: 12px; margin: 2px 0 8px; }
        .mtc-qty-form { display: flex; align-items: center; gap: 8px; }
        .mtc-qty-input { width: 54px; padding: 6px 8px; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-size: 13px; }
        .mtc-btn-ghost { background: transparent; border: 1px solid #2A2A2A; color: #8A8A85; border-radius: 6px; padding: 6px 10px; font-size: 12px; cursor: pointer; }
        .mtc-item-price { font-family: 'JetBrains Mono', monospace; color: #FF5A1F; font-weight: 600; font-size: 14px; margin: 0 0 8px; }
        .mtc-remove-btn { background: transparent; border: none; color: #7A5A50; font-size: 12px; cursor: pointer; text-decoration: underline; }
        .mtc-total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 16px; background: #141311; border: 1px solid #201F1C; border-radius: 10px; font-weight: 600; }
        .mtc-total-amount { font-family: 'JetBrains Mono', monospace; color: #FF5A1F; font-size: 18px; }
        .mtc-checkout-card { margin-top: 16px; background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-details-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 14px; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 13px; color: #8A8A85; }
        .mtc-field-input { width: 100%; padding: 10px 12px; margin-bottom: 16px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; }
        .mtc-field-textarea { width: 100%; padding: 10px 12px; margin-bottom: 16px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; min-height: 70px; resize: vertical; }
        .mtc-field-input:focus, .mtc-field-textarea:focus { outline: none; border-color: #FF5A1F; }
        .mtc-btn-primary { width: 100%; padding: 12px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .mtc-error-banner { max-width: 560px; margin: 0 auto 20px; padding: 14px 16px; background: #1A1210; border: 1px solid #3A2420; border-radius: 8px; color: #E07050; font-size: 13px; line-height: 1.5; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/shop" className="mtc-back">&larr; Continue shopping</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Your Cart</h1>
        </div>

        <div className="mtc-body">
          {stockError && (
            <div className="mtc-error-banner">
              Sorry — only {stockErrorAvailable} of "{stockErrorProduct}" left in stock. Please update the quantity in your cart before checking out.
            </div>
          )}

          {items.length === 0 ? (
            <div className="mtc-empty">Your cart is empty.</div>
          ) : (
            <>
              <div className="mtc-items">
                {items.map((item) => {
                  const optionLabel = item.variant
                    ? [item.variant.color, item.variant.size].filter(Boolean).join(" / ")
                    : item.size;
                  return (
                    <div className="mtc-item" key={`${item.product_id}-${item.variant_id || item.size}`}>
                      {item.product.image_url && (
                        <img src={item.product.image_url} alt={item.product.name} className="mtc-item-img" />
                      )}
                      <div style={{ flex: 1 }}>
                        <p className="mtc-item-name">{item.product.name}</p>
                        {optionLabel && <p className="mtc-item-meta">{optionLabel}</p>}
                        <form action="/api/cart/update" method="POST" className="mtc-qty-form">
                          <input type="hidden" name="product_id" value={item.product_id} />
                          {item.variant_id && <input type="hidden" name="variant_id" value={item.variant_id} />}
                          {item.size && <input type="hidden" name="size" value={item.size} />}
                          <input type="number" name="quantity" min="1" defaultValue={item.quantity} className="mtc-qty-input" />
                          <button type="submit" className="mtc-btn-ghost">Update</button>
                        </form>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p className="mtc-item-price">RM {item.lineTotal.toFixed(2)}</p>
                        <form action="/api/cart/remove" method="POST">
                          <input type="hidden" name="product_id" value={item.product_id} />
                          {item.variant_id && <input type="hidden" name="variant_id" value={item.variant_id} />}
                          {item.size && <input type="hidden" name="size" value={item.size} />}
                          <button type="submit" className="mtc-remove-btn">Remove</button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mtc-total-row">
                <span>Total</span>
                <span className="mtc-total-amount">RM {total.toFixed(2)}</span>
              </div>

              <form action="/api/checkout" method="POST" className="mtc-checkout-card">
                <p className="mtc-details-title">Shipping Details</p>

                <label className="mtc-field-label">Name</label>
                <input type="text" name="shipping_name" defaultValue={runner?.name || ""} required className="mtc-field-input" />

                <label className="mtc-field-label">WhatsApp / Phone</label>
                <input type="text" name="shipping_phone" defaultValue={runner?.whatsapp || ""} required className="mtc-field-input" />

                <label className="mtc-field-label">Delivery Address</label>
                <textarea name="shipping_address" defaultValue={runner?.address || ""} required className="mtc-field-textarea" />

                <button type="submit" className="mtc-btn-primary">Proceed to Payment</button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
