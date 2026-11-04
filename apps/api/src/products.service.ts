import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

const DATA_DIR = join(__dirname, "..", "data");
const DATA_FILE = join(DATA_DIR, "products.json");

const seed: Product[] = [
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

@Injectable()
export class ProductsService {
  private products: Product[] = this.load();

  private load(): Product[] {
    try {
      if (existsSync(DATA_FILE)) {
        return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
      }
    } catch {
      // fall through to seed data if the file is missing or corrupt
    }
    return seed;
  }

  private persist() {
    try {
      if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(DATA_FILE, JSON.stringify(this.products, null, 2));
    } catch {
      // best-effort persistence; in-memory state still works for the current process
    }
  }

  all() {
    return this.products;
  }

  create(input: Omit<Product, "id">) {
    const product: Product = { ...input, id: randomUUID().slice(0, 8) };
    this.products.push(product);
    this.persist();
    return product;
  }

  update(id: string, input: Partial<Product>) {
    const product = this.products.find(p => p.id === id);
    if (!product) return null;
    Object.assign(product, input);
    this.persist();
    return product;
  }

  remove(id: string) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    this.persist();
    return true;
  }
}
