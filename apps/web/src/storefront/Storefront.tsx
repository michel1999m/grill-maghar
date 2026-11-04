import { useEffect, useMemo, useState } from "react";
import { categoryLabels, fallbackProducts } from "../data/products";
import { createOrder, DEMO_MODE, fetchProducts, fetchSettings } from "../lib/api";
import { CartItem, Order, Product } from "../types";
import { Customize } from "./Customize";

type View = "shop" | "cart" | "checkout" | "success";

const money = (n: number) => `₪${n.toFixed(0)}`;

export function Storefront({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [view, setView] = useState<View>("shop");
  const [category, setCategory] = useState<string>("pita");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState({ name: "", phone: "", type: "pickup" as "pickup" | "delivery", address: "" });
  const [settingsFee, setSettingsFee] = useState(15);

  useEffect(() => {
    fetchProducts().then(data => {
      if (data && data.length) {
        setProducts(data);
        if (!data.some(p => p.category === category)) setCategory(data[0].category);
      }
    });
  }, []);

  // re-read on every checkout visit so a fee changed in the admin shows up without a refresh
  useEffect(() => {
    if (view === "checkout") fetchSettings().then(s => s && setSettingsFee(s.deliveryFee));
  }, [view]);

  const categories = useMemo(() => {
    const ids = Array.from(new Set(products.map(p => p.category)));
    return ids.map(id => ({ id, label: categoryLabels[id] || id }));
  }, [products]);

  const visible = useMemo(() => products.filter(p => p.category === category), [products, category]);
  const subtotal = cart.reduce((s, x) => s + x.finalPrice * x.quantity, 0);
  const deliveryFee = customer.type === "delivery" ? settingsFee : 0;
  const total = subtotal + deliveryFee;

  const addToCart = (item: CartItem) => {
    setCart(c => [...c, item]);
    setSelected(null);
  };

  const addSimple = (p: Product) => {
    addToCart({ ...p, quantity: 1, sauces: [], extras: [], note: "", finalPrice: p.price });
  };

  async function checkout() {
    if (!customer.name || !customer.phone) return alert("נא למלא שם ומספר טלפון");
    if (customer.type === "delivery" && !customer.address) return alert("נא למלא כתובת למשלוח");
    const created = await createOrder({
      customerName: customer.name,
      phone: customer.phone,
      type: customer.type,
      address: customer.address,
      items: cart,
      subtotal,
      deliveryFee,
      total,
      status: "paid"
    });
    setOrder(created);
    setCart([]);
    setView("success");
  }

  return (
    <div className="app">
      {DEMO_MODE && <div className="demo-banner">תצוגת תפריט בלבד — הזמנות אינן נשלחות למטבח</div>}
      <header className="topbar">
        <button className="icon-btn" onClick={onOpenAdmin} title="ניהול">☰</button>
        <div className="brand">
          <div className="brand-script">גריל מע'אר</div>
          <div>שיפודים • שווארמה</div>
        </div>
        <button className="icon-btn" onClick={() => setView("cart")}>
          🛒<span className="badge">{cart.length}</span>
        </button>
      </header>

      {view === "shop" && (
        <>
          <section className="hero">
            <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=85" />
            <div className="hero-card">
              <span className="open-dot">●</span> פתוח עד 12:00
              <h1>טעם של על האש</h1>
              <p>בחרו את המנה שלכם והרכיבו אותה בדיוק כמו שאתם אוהבים.</p>
            </div>
          </section>

          <div className="search">
            <span>⌕</span>
            <input placeholder="חפשו בגריל מע'אר" />
            <button>ⓘ</button>
          </div>

          <nav className="categories">
            {categories.map(c => (
              <button className={category === c.id ? "active" : ""} onClick={() => setCategory(c.id)} key={c.id}>
                {c.label}
              </button>
            ))}
          </nav>

          <main className="content">
            <h2>{categoryLabels[category] || category}</h2>
            <div className="product-list">
              {visible.map(p => (
                <article className="product-card" key={p.id}>
                  <img src={p.image} alt="" />
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <strong>{money(p.price)}</strong>
                    <div className="product-actions">
                      <button className="outline" onClick={() => (selected === p ? setSelected(null) : setSelected(p))}>
                        {p.category === "pita" || p.category === "plate" ? "הרכבת מנה" : "הוספה"}
                      </button>
                      {p.category !== "pita" && p.category !== "plate" && (
                        <button className="plus" onClick={() => addSimple(p)}>+</button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>

          {selected && <Customize product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />}
        </>
      )}

      {view === "cart" && (
        <section className="page">
          <button className="back" onClick={() => setView("shop")}>→ חזרה לתפריט</button>
          <h1>ההזמנה שלי</h1>
          {cart.length === 0 ? (
            <div className="empty">הסל ריק כרגע.</div>
          ) : (
            <>
              {cart.map((x, i) => (
                <div className="cart-row" key={i}>
                  <div>
                    <b>{x.name}</b>
                    <small>{[...x.sauces, ...x.extras].join(" • ")}</small>
                  </div>
                  <b>{money(x.finalPrice * x.quantity)}</b>
                </div>
              ))}
              <div className="total">
                <span>סה״כ</span>
                <b>{money(subtotal)}</b>
              </div>
              <button className="primary wide" onClick={() => setView("checkout")}>המשך לתשלום</button>
            </>
          )}
        </section>
      )}

      {view === "checkout" && (
        <section className="page">
          <button className="back" onClick={() => setView("cart")}>→ חזרה לסל</button>
          <h1>פרטי הזמנה</h1>
          <div className="form">
            <label>
              שם מלא
              <input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
            </label>
            <label>
              טלפון
              <input inputMode="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
            </label>
            <div className="choice-grid">
              <button className={customer.type === "pickup" ? "choice selected" : "choice"} onClick={() => setCustomer({ ...customer, type: "pickup" })}>
                📍<b>איסוף עצמי</b>
                <span>נארוז את ההזמנה ותוכלו לאסוף בקרוב</span>
              </button>
              <button className={customer.type === "delivery" ? "choice selected" : "choice"} onClick={() => setCustomer({ ...customer, type: "delivery" })}>
                🛵<b>משלוח</b>
                <span>השליח יביא את ההזמנה עד פתח הבית · {settingsFee ? `דמי משלוח ${money(settingsFee)}` : "משלוח חינם"}</span>
              </button>
            </div>
            {customer.type === "delivery" && (
              <label>
                כתובת למשלוח
                <textarea value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
              </label>
            )}
            <div className="summary">
              <div><span>מנות</span><b>{money(subtotal)}</b></div>
              {customer.type === "delivery" && (
                <div><span>דמי משלוח</span><b>{deliveryFee ? money(deliveryFee) : "חינם"}</b></div>
              )}
              <div className="summary-total"><span>סה״כ לתשלום</span><b>{money(total)}</b></div>
            </div>
            <div className="payment-box">
              <b>תשלום מאובטח</b>
              <span>💳 כרטיס אשראי</span>
              <span> Pay</span>
              <span>Bit</span>
              <small>בסביבת production מחברים כאן Grow / CardCom / YaadPay.</small>
            </div>
            <button className="primary wide" onClick={checkout}>שלם {money(total)}</button>
          </div>
        </section>
      )}

      {view === "success" && order && (
        <section className="success">
          <div className="success-icon">✓</div>
          <h1>ההזמנה התקבלה!</h1>
          <p>
            מספר הזמנה <b>#{order.id}</b>
          </p>
          <p className="muted">
            סה״כ ששולם {money(order.total)}
            {order.deliveryFee ? ` (כולל ${money(order.deliveryFee)} משלוח)` : ""}
          </p>
          <div className="status-box">
            <b>ההזמנה התקבלה ומשולמת</b>
            <span>נעדכן אתכם כשהמנה תהיה בהכנה ומוכנה.</span>
          </div>
          <button className="primary wide" onClick={() => setView("shop")}>חזרה לתפריט</button>
        </section>
      )}
    </div>
  );
}
