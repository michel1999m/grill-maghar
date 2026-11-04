import { useEffect, useState } from "react";
import { categoryLabels, fallbackProducts } from "../data/products";
import { createProduct, deleteProduct, fetchProducts, updateProduct } from "../lib/api";
import { Product } from "../types";

const emptyForm = { name: "", description: "", price: "", category: "pita", image: "" };

function resizeImage(file: File, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    img.src = url;
  });
}

export function MenuManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data ?? fallbackProducts);
    setLoading(false);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image: p.image });
    setError("");
  }

  function startNew() {
    setEditingId("new");
    setForm(emptyForm);
    setError("");
  }

  function cancel() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function save() {
    const price = Number(form.price);
    if (!form.name.trim()) return setError("נא להזין שם מנה");
    if (!Number.isFinite(price) || price < 0) return setError("נא להזין מחיר תקין");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category: form.category.trim() || "pita",
      image: form.image.trim() || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80"
    };

    try {
      if (editingId === "new") {
        await createProduct(payload);
      } else if (editingId) {
        await updateProduct(editingId, payload);
      }
      cancel();
      await load();
    } catch (e: any) {
      setError(e.message || "שמירה נכשלה");
    }
  }

  async function pickImage(file?: File) {
    if (!file) return;
    try {
      const image = await resizeImage(file, 800);
      setForm(f => ({ ...f, image }));
      setError("");
    } catch {
      setError("לא הצלחנו לקרוא את הקובץ — נסו תמונת JPG או PNG.");
    }
  }

  async function remove(id: string) {
    if (!confirm("למחוק את המנה הזו מהתפריט?")) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (e: any) {
      setError(e.message || "מחיקה נכשלה");
    }
  }

  if (loading) return <div className="menu-manager"><p className="muted">טוען תפריט…</p></div>;

  return (
    <div className="menu-manager">
      {editingId === null && (
        <button className="primary wide" onClick={startNew}>+ הוספת מנה חדשה</button>
      )}

      {editingId !== null && (
        <div className="menu-form">
          <h3>{editingId === "new" ? "מנה חדשה" : "עריכת מנה"}</h3>
          <label>שם המנה<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>תיאור<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <div className="choice-grid">
            <label>מחיר (₪)<input inputMode="decimal" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
            <label>קטגוריה
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {Object.entries(categoryLabels).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
                {!Object.keys(categoryLabels).includes(form.category) && form.category && (
                  <option value={form.category}>{form.category} (חדשה)</option>
                )}
              </select>
            </label>
          </div>
          <label>קטגוריה מותאמת אישית (אופציונלי)<input placeholder="למשל: מבצעים" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label>
          <div className="image-picker">
            {form.image ? <img className="menu-preview" src={form.image} alt="" /> : <div className="menu-preview empty-preview">אין תמונה</div>}
            <label className="outline upload-btn">
              {form.image ? "החלפת תמונה" : "העלאת תמונה"}
              <input type="file" accept="image/*" hidden onChange={e => pickImage(e.target.files?.[0])} />
            </label>
          </div>
          <label>או קישור לתמונה<input value={form.image.startsWith("data:") ? "" : form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></label>
          {error && <span className="field-error">{error}</span>}
          <div className="choice-grid">
            <button className="outline" onClick={cancel}>ביטול</button>
            <button className="primary" onClick={save}>שמירה</button>
          </div>
        </div>
      )}

      <div className="menu-list">
        {products.map(p => (
          <article className="menu-row" key={p.id}>
            <img src={p.image} alt="" />
            <div className="menu-row-info">
              <b>{p.name}</b>
              <span className="muted">{categoryLabels[p.category] || p.category}</span>
              <strong>₪{p.price}</strong>
            </div>
            <div className="menu-row-actions">
              <button className="outline" onClick={() => startEdit(p)}>עריכה</button>
              <button className="outline danger" onClick={() => remove(p.id)}>מחיקה</button>
            </div>
          </article>
        ))}
        {products.length === 0 && <p className="muted">אין מנות בתפריט עדיין.</p>}
      </div>
    </div>
  );
}
