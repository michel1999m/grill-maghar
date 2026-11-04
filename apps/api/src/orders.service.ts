import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { SettingsService } from "./settings.service";

export type Order = any;

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  constructor(private readonly settings: SettingsService) {}

  create(input: Order) {
    const items = Array.isArray(input.items) ? input.items : [];
    const subtotal = items.reduce((s: number, x: any) => s + Number(x.finalPrice) * Number(x.quantity), 0);
    // the fee comes from the server's settings, never from the client, so it can't be skipped
    const deliveryFee = input.type === "delivery" ? this.settings.get().deliveryFee : 0;
    const order = {
      ...input,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      id: `ORD-${randomUUID().slice(0, 6).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };
    this.orders.unshift(order);
    return order;
  }

  all() {
    return this.orders;
  }

  update(id: string, status: string) {
    const order = this.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    return order;
  }
}
