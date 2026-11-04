import { useState } from "react";
import { getAdminKey, setAdminKey } from "../lib/api";
import { MenuManager } from "./MenuManager";
import { OrdersBoard } from "./OrdersBoard";
import { SettingsPanel } from "./SettingsPanel";

type Tab = "orders" | "menu" | "settings";

export function Admin({ onBack }: { onBack: () => void }) {
  const [unlocked, setUnlocked] = useState(!!getAdminKey());
  const [tab, setTab] = useState<Tab>("orders");

  if (!unlocked) {
    return <AdminLogin onBack={onBack} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="admin">
      <header className="admin-head">
        <button className="back" onClick={onBack}>→ חזרה</button>
        <h1>ניהול</h1>
        <span className="live">● LIVE</span>
      </header>
      <nav className="admin-tabs">
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>הזמנות</button>
        <button className={tab === "menu" ? "active" : ""} onClick={() => setTab("menu")}>ניהול תפריט</button>
        <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>הגדרות</button>
      </nav>
      {tab === "orders" && <OrdersBoard />}
      {tab === "menu" && <MenuManager />}
      {tab === "settings" && <SettingsPanel />}
    </div>
  );
}

function AdminLogin({ onBack, onUnlock }: { onBack: () => void; onUnlock: () => void }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!key.trim()) {
      setError("נא להזין מפתח ניהול");
      return;
    }
    setAdminKey(key.trim());
    onUnlock();
  };

  return (
    <div className="admin admin-login">
      <header className="admin-head">
        <button className="back" onClick={onBack}>→ חזרה</button>
        <h1>כניסת ניהול</h1>
      </header>
      <div className="login-box">
        <p>הזינו את מפתח הניהול כדי לגשת למסך המטבח ולתפריט.</p>
        <input
          type="password"
          placeholder="מפתח ניהול"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
        />
        {error && <span className="field-error">{error}</span>}
        <button className="primary wide" onClick={submit}>כניסה</button>
        <small className="muted">
          מוגדר בצד השרת ב-ADMIN_KEY (ברירת מחדל בפיתוח: dev-admin-key).
        </small>
      </div>
    </div>
  );
}
