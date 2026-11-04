export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

export type CartItem = Product & {
  quantity: number;
  sauces: string[];
  extras: string[];
  note: string;
  finalPrice: number;
};

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  type: "pickup" | "delivery";
  address?: string;
  items: CartItem[];
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  status: "paid" | "preparing" | "ready" | "completed";
  createdAt: string;
};

export type Settings = {
  deliveryFee: number;
};
