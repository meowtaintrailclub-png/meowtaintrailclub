import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { getLoggedInRunnerId } from "../../lib/session";

export const dynamic = "force-dynamic";

const SIZES = ["XS", "S", "M", "L", "XL"];

async function getProducts() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export default async function Shop({ searchParams }) {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const products = await getProducts();
  const justAdded = searchParams?.added === "1";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-back { display: block; color: #8A8A85; font-size: 13px; text-decoration: none; margin-bottom: 18px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 32px; margin: 0 0 16px; }
        .mtc-cart-link { color: #FF5A1F; text-decoration: none; font-weight: 600; font-size: 14px; }
        .mtc-added-banner { max-width: 900px; margin: 20px auto 0; padding: 0 20px; text-align: center; color: #5CA36E; font-size: 14px; }
        .mtc-empty { max-width: 440px; margin: 40px auto 0; padding: 40px 24px; background: #141311; border: 1px solid #201F1C; border-radius: 10px; text-align: center; color: #8A8A85; }
        .mtc-grid { max-width: 900px; margin: 28px auto 0; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .mtc-product-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 16px; text-align: left; }
        .mtc-product-img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 8px; margin-bottom: 12px; background: #0D0D0D; }
        .mtc-product-name { font-weight: 600; font-size: 15px; margin: 0 0 4px; }
        .mtc-product-desc { color: #8A8A85; font-size: 13px; margin: 0 0 8px; line-height: 1.5; }
        .mtc-product-price { font-family: 'JetBrains Mono', monospace; color: #FF5A1F; font-weight: 600; font-size: 15px; margin: 0 0 12px; }
        .mtc-add-form { display: flex; gap: 8px; flex-wrap: wrap; }
        .mtc-field-input { padding: 8px 10px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 13px; }
        .mtc-field-input:focus { outline: none; border-color: #FF5A1F; }
        select.mtc-field-input { flex: 1; min-width: 90px; }
        input[type="number"].mtc-field-input { width: 60px; }
        .mtc-btn-primary { width: 100%; margin-top: 8px; padding: 9px 16px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/profile" className="mtc-back">&larr; Back to my profile</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Shop</h1>
          <a href="/cart" className="mtc-cart-link">View Cart &rarr;</a>
        </div>

        {justAdded && <p className="mtc-added-banner">Added to cart.</p>}

        {products.length === 0 ? (
          <div className="mtc-empty">No items available right now.</div>
        ) : (
          <div className="mtc-grid">
            {products.map((p) => (
              <div className="mtc-product-card" key={p.id}>
                {p.image_url && <img src={p.image_url} alt={p.name} className="mtc-product-img" />}
                <p className="mtc-product-name">{p.name}</p>
                {p.description && <p className="mtc-product-desc">{p.description}</p>}
                <p className="mtc-product-price">RM {Number(p.price).toFixed(2)}</p>
                <form action="/api/cart/add" method="POST" className="mtc-add-form">
                  <input type="hidden" name="product_id" value={p.id} />
                  <select name="size" required defaultValue="" className="mtc-field-input">
                    <option value="" disabled>Size</option>
                    {SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input type="number" name="quantity" min="1" defaultValue="1" className="mtc-field-input" />
                  <button type="submit" className="mtc-btn-primary">Add to Cart</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
