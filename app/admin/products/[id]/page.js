import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../lib/adminSession";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }) {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const supabase = supabaseAdmin();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !product) {
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
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 28px; margin: 0; }
        .mtc-body { max-width: 520px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-thumb { width: 100%; max-width: 200px; aspect-ratio: 1/1; object-fit: cover; border-radius: 10px; margin: 0 auto 20px; display: block; }
        .mtc-details-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-details-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 14px; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 13px; color: #8A8A85; }
        .mtc-field-input { width: 100%; padding: 10px 12px; margin-bottom: 16px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; }
        .mtc-field-textarea { width: 100%; padding: 10px 12px; margin-bottom: 16px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; min-height: 70px; resize: vertical; }
        .mtc-field-input:focus, .mtc-field-textarea:focus { outline: none; border-color: #FF5A1F; }
        .mtc-hint { color: #5A5854; font-size: 12px; margin: -10px 0 16px; line-height: 1.5; }
        .mtc-checkbox-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .mtc-checkbox-row input { width: 18px; height: 18px; accent-color: #FF5A1F; }
        .mtc-checkbox-row label { font-size: 14px; color: #F5F1EA; }
        .mtc-btn-primary { display: inline-block; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin/products" className="mtc-back">&larr; Back to products</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Edit Product</h1>
        </div>

        <div className="mtc-body">
          {product.image_url && <img src={product.image_url} alt={product.name} className="mtc-thumb" />}

          <form action="/api/admin/products/update" method="POST" className="mtc-details-card">
            <input type="hidden" name="id" value={product.id} />
            <p className="mtc-details-title">Product Details</p>

            <label className="mtc-field-label">Name</label>
            <input type="text" name="name" defaultValue={product.name} required className="mtc-field-input" />

            <label className="mtc-field-label">Description</label>
            <textarea name="description" defaultValue={product.description || ""} className="mtc-field-textarea" />

            <label className="mtc-field-label">Price (RM)</label>
            <input type="number" name="price" step="0.01" min="0" defaultValue={product.price} required className="mtc-field-input" />

            <label className="mtc-field-label">Stock Quantity</label>
            <input type="number" name="stock_quantity" min="0" step="1" defaultValue={product.stock_quantity ?? ""} className="mtc-field-input" placeholder="Leave blank for unlimited" />
            <p className="mtc-hint">Leave blank for unlimited stock. Set a number to prevent overselling once it hits 0.</p>

            <div className="mtc-checkbox-row">
              <input type="checkbox" name="active" id="active" defaultChecked={product.active} />
              <label htmlFor="active">Active (visible in shop)</label>
            </div>

            <button type="submit" className="mtc-btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </>
  );
}
