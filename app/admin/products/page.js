import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { isAdminLoggedIn } from "../../../lib/adminSession";

export const dynamic = "force-dynamic";

async function getVariants(productId) {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

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

  const variants = await getVariants(params.id);

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
        .mtc-btn-primary { display: block; width: 100%; padding: 12px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; margin-top: 8px; }
        .mtc-variants-section { border-top: 1px solid #2A2A2A; margin-top: 20px; padding-top: 20px; }
        .mtc-variants-label { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; margin: 0 0 4px; }
        .mtc-variants-hint { color: #5A5854; font-size: 12px; margin: 0 0 14px; line-height: 1.5; }
        .mtc-variant-input-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
        .mtc-variant-input-row input { padding: 8px 10px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 13px; }
        .mtc-variant-input-row input:focus { outline: none; border-color: #FF5A1F; }
        .mtc-variant-size { flex: 1; min-width: 60px; }
        .mtc-variant-color { flex: 1; min-width: 70px; }
        .mtc-variant-stock { width: 65px; }
        .mtc-remove-row-btn { background: transparent; border: 1px solid #2A2A2A; color: #7A5A50; border-radius: 6px; padding: 8px 10px; font-size: 12px; cursor: pointer; flex-shrink: 0; }
        .mtc-add-row-btn { background: transparent; border: 1px dashed #3A3733; color: #8A8A85; border-radius: 6px; padding: 8px 14px; font-size: 12px; cursor: pointer; margin-top: 4px; margin-bottom: 6px; }
        .mtc-add-row-btn:hover { border-color: #FF5A1F; color: #FF5A1F; }
        .mtc-empty-text { color: #5A5854; font-size: 13px; font-style: italic; margin: 0 0 10px; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin/products" className="mtc-back">&larr; Back to products</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Edit Product</h1>
        </div>

        <div className="mtc-body">
          {product.image_url && <img src={product.image_url} alt={product.name} className="mtc-thumb" />}

          {/* Standalone delete forms, kept outside the main form since forms can't nest.
              Each delete button below references one of these via its "form" attribute. */}
          {variants.map((v) => (
            <form key={`delform-${v.id}`} id={`delete-form-${v.id}`} action="/api/admin/products/variants/delete" method="POST" style={{ display: "none" }}>
              <input type="hidden" name="id" value={v.id} />
              <input type="hidden" name="product_id" value={product.id} />
            </form>
          ))}

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
            <p className="mtc-hint">
              {variants.length > 0
                ? "This product has variants below — their individual stock counts are what actually control availability, this field is ignored."
                : "Leave blank for unlimited stock. Set a number to prevent overselling once it hits 0."}
            </p>

            <div className="mtc-checkbox-row">
              <input type="checkbox" name="active" id="active" defaultChecked={product.active} />
              <label htmlFor="active">Active (visible in shop)</label>
            </div>

            <div className="mtc-variants-section">
              <p className="mtc-variants-label">Variants</p>
              <p className="mtc-variants-hint">Edit sizes, colors, and stock below, add new ones, or delete any you no longer need — everything saves together with the button at the bottom.</p>

              {variants.length === 0 ? (
                <p className="mtc-empty-text">No variants yet.</p>
              ) : (
                variants.map((v) => (
                  <div className="mtc-variant-input-row" key={v.id}>
                    <input type="hidden" name="variant_existing_id" value={v.id} />
                    <input type="text" name="variant_existing_size" defaultValue={v.size || ""} className="mtc-variant-size" placeholder="Size" />
                    <input type="text" name="variant_existing_color" defaultValue={v.color || ""} className="mtc-variant-color" placeholder="Color" />
                    <input type="number" name="variant_existing_stock" min="0" step="1" defaultValue={v.stock_quantity} className="mtc-variant-stock" />
                    <button type="submit" form={`delete-form-${v.id}`} className="mtc-remove-row-btn">Delete</button>
                  </div>
                ))
              )}

              <div id="mtc-new-variant-rows"></div>

              <button type="button" id="mtc-add-variant-btn" className="mtc-add-row-btn">+ Add another variant</button>
            </div>

            <button type="submit" className="mtc-btn-primary">Save All Changes</button>
          </form>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            var addBtn = document.getElementById('mtc-add-variant-btn');
            var rowsContainer = document.getElementById('mtc-new-variant-rows');

            function addVariantRow() {
              var row = document.createElement('div');
              row.className = 'mtc-variant-input-row';
              row.innerHTML =
                '<input type="text" name="variant_new_size" class="mtc-variant-size" placeholder="Size (e.g. M)">' +
                '<input type="text" name="variant_new_color" class="mtc-variant-color" placeholder="Color (e.g. Black)">' +
                '<input type="number" name="variant_new_stock" min="0" step="1" class="mtc-variant-stock" placeholder="Stock">' +
                '<button type="button" class="mtc-remove-row-btn">Remove</button>';
              row.querySelector('.mtc-remove-row-btn').addEventListener('click', function () {
                row.remove();
              });
              rowsContainer.appendChild(row);
            }

            if (addBtn) {
              addBtn.addEventListener('click', addVariantRow);
            }
          `,
        }}
      />
    </>
  );
}
