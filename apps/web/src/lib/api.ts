import { io } from "socket.io-client";
import { Order, Product, Settings } from "../types";

// No API URL in a production build means there is no server behind this deploy
// (e.g. GitHub Pages), so the app runs as a read-only menu preview.
const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");
export const DEMO_MODE = !API;

const NO_SERVER = "אין חיבור לשרת — בתצוגת התפריט הזו אי אפשר לשמור שינויים.";
const ADMIN_KEY_STORAGE = "admin-key";

export function getAdminKey() {
  return localStorage.getItem(ADMIN_KEY_STORAGE) || "";
}

export function setAdminKey(key: string) {
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

function adminHeaders() {
  return { "x-admin-key": getAdminKey() };
}

export async function fetchProducts(): Promise<Product[] | null> {
  if (DEMO_MODE) return null;
  try {
    const res = await fetch(`${API}/products`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return null;
  }
}

export async function createProduct(product: Omit<Product, "id">) {
  if (DEMO_MODE) throw new Error(NO_SERVER);
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error("שמירת המנה נכשלה — בדקו את מפתח הניהול");
  return (await res.json()) as Product;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  if (DEMO_MODE) throw new Error(NO_SERVER);
  const res = await fetch(`${API}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error("עדכון המנה נכשל — בדקו את מפתח הניהול");
  return (await res.json()) as Product;
}

export async function deleteProduct(id: string) {
  if (DEMO_MODE) throw new Error(NO_SERVER);
  const res = await fetch(`${API}/products/${id}`, {
    method: "DELETE",
    headers: adminHeaders()
  });
  if (!res.ok) throw new Error("מחיקת המנה נכשלה — בדקו את מפתח הניהול");
}

export async function fetchSettings(): Promise<Settings | null> {
  if (DEMO_MODE) return null;
  try {
    const res = await fetch(`${API}/settings`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateSettings(settings: Settings) {
  if (DEMO_MODE) throw new Error(NO_SERVER);
  const res = await fetch(`${API}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error("שמירת ההגדרות נכשלה — בדקו את מפתח הניהול");
  return (await res.json()) as Settings;
}

export async function createOrder(order: Omit<Order, "id" | "createdAt">) {
  if (DEMO_MODE) return demoOrder(order);
  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error("API error");
    return (await res.json()) as Order;
  } catch {
    return demoOrder(order);
  }
}

function demoOrder(order: Omit<Order, "id" | "createdAt">) {
  return {
    ...order,
    id: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString()
  } as Order;
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  if (DEMO_MODE) throw new Error(NO_SERVER);
  const res = await fetch(`${API}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("עדכון סטטוס נכשל — בדקו את מפתח הניהול");
  return (await res.json()) as Order;
}

export async function fetchOrders(): Promise<Order[] | null> {
  if (DEMO_MODE) return null;
  try {
    const res = await fetch(`${API}/orders`, { headers: adminHeaders() });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return null;
  }
}

// The API gateway is socket.io, which a plain browser WebSocket cannot talk to.
export function connectOrdersSocket(onMessage: (data: any) => void) {
  if (DEMO_MODE) return null;
  const socket = io(`${API}/orders`);
  socket.on("order.created", onMessage);
  socket.on("order.updated", onMessage);
  return socket;
}
