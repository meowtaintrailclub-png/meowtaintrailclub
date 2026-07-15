import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { isAdminLoggedIn } from "../../../lib/adminSession";

export const dynamic = "force-dynamic";

async function getProducts() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export default async function ProductsAdmin() {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const products = await getProducts();

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
        .mtc-body { max-width: 520px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-details-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-details-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 14px; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 13px; color: #8A8A85; }
        .mtc-field-input { width: 100%; padding: 10px 12px; margin-bottom: 8px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; }
        .mtc-field-input:focus { outline: none; border-color: #FF5A1F; }
        .mtc-field-textarea { width: 100%; padding: 10px 12px; margin-bottom: 8px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; min-height: 70px; resize: vertical; }
        .mtc-field-file { width: 100%; padding: 10px 0; margin-bottom: 16px; color: #8A8A85; font-size: 13px; }
        .mtc-hint { color: #5A5854; font-size: 12px; margin: -4px 0 16px; line-height: 1.5; }
        .mtc-btn-primary { display: inline-block; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .mtc-btn-danger { padding: 7px 14px; background: transparent; border: 1px solid #B23B22; color: #E07050; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; }
        .mtc-list-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; margin-top: 16px; text-align: left; }
        .mtc-empty-text { color: #5A5854; font-size: 14px; font-style: italic; }
        .mtc-product-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #201F1C; }
        .mtc-product-row:last-child { border-bottom: none; }
        .mtc-product-thumb { width: 48px; height: 48px; object-fit: cover; background: #0D0D0D; border-radius: 6px; flex-shrink: 0; }
        .mtc-product-name { font-weight: 600; font-size: 14px; margin: 0; }
        .mtc-product-price { color: #FF5A1F; font-family: 'JetBrains Mono', monospace; font-size: 13px; margin: 2px 0 0; }
        .mtc-product-stock { font-family: 'JetBrains Mono', monospace; font-size: 12px; margin: 2px 0 0; }
        .mtc-product-stock.low { color: #E07050; }
        .mtc-product-stock.ok { color: #8A8A85; }
        .mtc-product-actions { display: flex; gap: 8px; align-items: center; }
        .mtc-edit-link { color: #FF5A1F; text-decoration: none; font-weight: 600; font-size: 12px; }
        .mtc-edit-link:hover { text-decoration: underline; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin" className="mtc-back">&larr; Back to members</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Shop Products</h1>
        </div>

        <div className="mtc-body">
          <form action="/api/admin/products/add" method="POST" encType="multipart/form-data" className="mtc-details-card">
            <p className="mtc-details-title">Add a product</p>

            <label className="mtc-field-label">Name</label>
            <input type="text" name="name" required className="mtc-field-input" placeholder="e.g. Club Trail Tee" />

            <label className="mtc-field-label">Description</label>
            <textarea name="description" className="mtc-field-textarea" placeholder="Optional short description" />

            <label className="mtc-field-label">Price (RM)</label>
            <input type="number" name="price" step="0.01" min="0" required className="mtc-field-input" placeholder="e.g. 45.00" />

            <label className="mtc-field-label">Stock Quantity</label>
            <input type="number" name="stock_quantity" min="0" step="1" className="mtc-field-input" placeholder="Leave blank for unlimited" />
            <p className="mtc-hint">Leave blank for unlimited stock.</p>

            <label className="mtc-field-label">Photo</label>
            <input type="file" name="image" accept="image/*" className="mtc-field-file" />

            <div style={{ marginTop: 8 }}>
              <button type="submit" className="mtc-btn-primary">Add Product</button>
            </div>
          </form>

          <div className="mtc-list-card">
            <p className="mtc-details-title">Current products</p>
            {products.length === 0 ? (
              <p className="mtc-empty-text">No products added yet.</p>
            ) : (
              products.map((p) => (
                <div className="mtc-product-row" key={p.id}>
                  {p.image_url && <img src={p.image_url} alt={p.name} className="mtc-product-thumb" />}
                  <div style={{ flex: 1 }}>
                    <p className="mtc-product-name">{p.name}</p>
                    <p className="mtc-product-price">RM {Number(p.price).toFixed(2)}</p>
                    <p className={`mtc-product-stock ${p.stock_quantity !== null && p.stock_quantity <= 5 ? "low" : "ok"}`}>
                      {p.stock_quantity === null ? "Unlimited stock" : `${p.stock_quantity} in stock`}
                      {!p.active && " · Inactive"}
                    </p>
                  </div>
                  <div className="mtc-product-actions">
                    <a href={`/admin/products/${p.id}`} className="mtc-edit-link">Edit</a>
                    <form action="/api/admin/products/delete" method="POST">
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="mtc-btn-danger">Remove</button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
