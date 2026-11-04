import { useEffect, useState } from "react";
import { fetchSettings, updateSettings } from "../lib/api";

export function SettingsPanel() {
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings().then(s => {
      setFee(String(s?.deliveryFee ?? 15));
      setLoading(false);
    });
  }, []);

  async function save() {
    const value = Number(fee);
    if (fee.trim() === "" || !Number.isFinite(value) || value < 0) {
      setMessage("");
      setError("נא להזין סכום תקין (0 ומעלה)");
      return;
    }
    try {
      await updateSettings({ deliveryFee: value });
      setError("");
      setMessage(`נשמר — דמי המשלוח עכשיו ₪${value}`);
    } catch (e: any) {
      setMessage("");
      setError(e.message || "השמירה נכשלה");
    }
  }

  if (loading) return <div className="menu-manager"><p className="muted">טוען הגדרות…</p></div>;

  return (
    <div className="menu-manager">
      <div className="menu-form">
        <h3>משלוחים</h3>
        <label>
          דמי משלוח (₪)
          <input inputMode="decimal" value={fee} onChange={e => setFee(e.target.value)} />
        </label>
        <small className="muted">נגבה רק בהזמנות במשלוח, לא באיסוף עצמי. הזינו 0 למשלוח חינם.</small>
        {error && <span className="field-error">{error}</span>}
        {message && <span className="field-ok">{message}</span>}
        <button className="primary" onClick={save}>שמירה</button>
      </div>
    </div>
  );
}
