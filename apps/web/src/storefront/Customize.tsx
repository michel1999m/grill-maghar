import { useState } from "react";
import { extras, sauces } from "../data/products";
import { CartItem, Product } from "../types";

const money = (n: number) => `₪${n.toFixed(0)}`;

export function Customize({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (x: CartItem) => void }) {
  const [chosenSauces, setChosenSauces] = useState<string[]>([]);
  const [chosenExtras, setChosenExtras] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const extraTotal = chosenExtras.reduce((s, n) => s + (extras.find(x => x.name === n)?.price || 0), 0);
  const finalPrice = product.price + extraTotal;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <img className="modal-img" src={product.image} />
        <div className="modal-body">
          <button className="close" onClick={onClose}>×</button>
          <h2>הרכיבו את {product.name}</h2>
          <p className="muted">בחרו סלטים ורטבים, תוספות והערות.</p>
          <h4>סלטים ורטבים</h4>
          <div className="chips">
            {sauces.map(s => (
              <button
                className={chosenSauces.includes(s) ? "chip selected" : "chip"}
                onClick={() => setChosenSauces(v => (v.includes(s) ? v.filter(x => x !== s) : [...v, s]))}
                key={s}
              >
                {s}
              </button>
            ))}
          </div>
          <h4>תוספות</h4>
          {extras.map(x => (
            <label className="check" key={x.name}>
              <input
                type="checkbox"
                checked={chosenExtras.includes(x.name)}
                onChange={() => setChosenExtras(v => (v.includes(x.name) ? v.filter(n => n !== x.name) : [...v, x.name]))}
              />
              <span>{x.name}</span>
              <b>+{money(x.price)}</b>
            </label>
          ))}
          <h4>הערות מיוחדות</h4>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="למשל: בלי בצל, הרבה טחינה בצד..." />
          <button
            className="primary wide"
            onClick={() => onAdd({ ...product, quantity: 1, sauces: chosenSauces, extras: chosenExtras, note, finalPrice })}
          >
            הוספה לסל • {money(finalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
