import { Product } from "../types";

// Fallback seed data — used only if the API is unreachable (e.g. offline demo).
// The source of truth once the API is running is the /products endpoint,
// which the admin "ניהול תפריט" screen writes to.
export const fallbackProducts: Product[] = [
  {
    id: "shawarma",
    name: "שווארמה הודו",
    description: "בחרו הגשה, סלטים וממרחים.",
    price: 58,
    category: "pita",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pargit",
    name: "פרגית",
    description: "נתחי פרגית עסיסיים על האש.",
    price: 58,
    category: "pita",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "lamb",
    name: "כבש",
    description: "כבש מתובל ומוכן על האש.",
    price: 64,
    category: "pita",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "mixed",
    name: "צלחת מעורבת",
    description: "מבחר בשרים עם סלטים ותוספות.",
    price: 78,
    category: "plate",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "fries",
    name: "צ'יפס",
    description: "צ'יפס חם וקריספי.",
    price: 16,
    category: "sides",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "salad",
    name: "סלט ערבי",
    description: "עגבנייה, מלפפון, בצל ופטרוזיליה.",
    price: 14,
    category: "sides",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "cola",
    name: "קולה",
    description: "בקבוק קר.",
    price: 10,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=80"
  }
];

export const categoryLabels: Record<string, string> = {
  pita: "פיתות",
  plate: "בצלחת",
  sides: "תוספות",
  drinks: "שתייה"
};

export const sauces = ["חומוס", "חריף", "עמבה", "טחינה", "סלט ערבי", "חמוצים"];
export const extras = [
  { name: "צ'יפס בצד", price: 8 },
  { name: "הגדלת מנה", price: 12 },
  { name: "שתייה בצרור", price: 7 }
];
