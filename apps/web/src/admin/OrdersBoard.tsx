import { useEffect, useMemo, useState } from "react";
import { connectOrdersSocket, DEMO_MODE, fetchOrders, updateOrderStatus } from "../lib/api";
import { Order } from "../types";

let audioCtx: AudioContext | null = null;

function primeAudio() {
  audioCtx ??= new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playTones(freqs: number[], type: OscillatorType, gap: number, length: number) {
  if (!audioCtx) return;
  const ctx = audioCtx;
  freqs.forEach((freq, i) => {
    const at = ctx.currentTime + i * gap;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.35, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + length + 0.01);
  });
}

const chime = () => playTones([988, 988, 988], "square", 0.2, 0.16);
const doneChime = () => playTones([523, 659, 784, 1047], "sine", 0.12, 0.32);

export function OrdersBoard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // browsers only allow sound after the user has touched the page once
    document.addEventListener("pointerdown", primeAudio);
    fetchOrders().then(data => data && setOrders(data));
    const socket = connectOrdersSocket(data => {
      if (data?.type === "order.created") {
        chime();
        setOrders(v => (v.some(o => o.id === data.order.id) ? v : [data.order, ...v]));
      }
      if (data?.type === "order.updated") setOrders(v => v.map(o => (o.id === data.order.id ? data.order : o)));
    });
    return () => {
      socket?.disconnect();
      document.removeEventListener("pointerdown", primeAudio);
    };
  }, []);

  const update = async (id: string, status: Order["status"]) => {
    setOrders(v => v.map(o => (o.id === id ? { ...o, status } : o)));
    if (status === "completed") doneChime();
    try {
      await updateOrderStatus(id, status);
    } catch {
      // API unreachable (demo mode) — local state above already reflects the change,
      // and a connected kitchen screen still gets it via the WebSocket broadcast.
    }
  };

  const groups = useMemo(
    () => ({
      paid: orders.filter(o => o.status === "paid"),
      preparing: orders.filter(o => o.status === "preparing"),
      ready: orders.filter(o => o.status === "ready")
    }),
    [orders]
  );

  if (DEMO_MODE) {
    return (
      <div className="menu-manager">
        <div className="menu-form">
          <h3>אין חיבור לשרת</h3>
          <p className="muted">
            התצוגה הזו מראה את התפריט בלבד. כדי לקבל הזמנות במטבח, לעדכן סטטוסים ולשמור שינויים,
            צריך להעלות גם את השרת (ראו DEPLOYMENT.md).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban">
      <Column title="חדשות" items={groups.paid} action="אישור והעברה להכנה" next="preparing" onUpdate={update} />
      <Column title="בהכנה" items={groups.preparing} action="המנה מוכנה" next="ready" onUpdate={update} />
      <Column title="מוכן" items={groups.ready} action="הושלם" next="completed" onUpdate={update} />
    </div>
  );
}

function Column({
  title,
  items,
  action,
  next,
  onUpdate
}: {
  title: string;
  items: Order[];
  action: string;
  next: Order["status"];
  onUpdate: (id: string, s: Order["status"]) => void;
}) {
  return (
    <section className="column">
      <div className="column-title">
        <h2>{title}</h2>
        <b>{items.length}</b>
      </div>
      {items.length === 0 && <div className="column-empty">אין הזמנות כרגע</div>}
      {items.map(o => (
        <article className="order-card" key={o.id}>
          <div className="order-top">
            <b>#{o.id}</b>
            <span>{new Date(o.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div>
            <b>{o.customerName}</b> • {o.type === "delivery" ? "משלוח" : "איסוף עצמי"}
          </div>
          {o.items.map((x, i) => (
            <div className="order-item" key={i}>
              <span>
                {x.quantity}× {x.name}
              </span>
              <small>
                {[...x.sauces, ...x.extras].join(", ")}
                {x.note && ` | ${x.note}`}
              </small>
            </div>
          ))}
          {o.type === "delivery" && o.address && <div className="order-address">📍 {o.address}</div>}
          {!!o.deliveryFee && (
            <div className="order-item">
              <span>דמי משלוח</span>
              <small>₪{o.deliveryFee}</small>
            </div>
          )}
          <div className="order-bottom">
            <strong>₪{o.total}</strong>
            <button className="primary" onClick={() => onUpdate(o.id, next)}>
              {action}
            </button>
          </div>
          <button className="print" onClick={() => window.print()}>
            🖨 הדפס פתק מטבח
          </button>
          <a
            className="whatsapp"
            target="_blank"
            rel="noreferrer"
            href={`https://wa.me/972${o.phone.replace(/^0/, "")}?text=${encodeURIComponent(
              `שלום ${o.customerName}, ההזמנה שלך מגריל מע'אר ${o.status === "paid" ? "נכנסה להכנה" : "מוכנה"}!`
            )}`}
          >
            שלח עדכון ב-WhatsApp
          </a>
        </article>
      ))}
    </section>
  );
}
