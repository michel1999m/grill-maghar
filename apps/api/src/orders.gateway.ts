import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { OrdersService } from "./orders.service";

@WebSocketGateway({ namespace: "/orders", cors: { origin: "*" } })
export class OrdersGateway {
  @WebSocketServer() server!: Server;

  constructor(private readonly service: OrdersService) {}

  broadcastCreated(order: any) {
    this.server.emit("order.created", { type: "order.created", order });
  }

  broadcastUpdated(order: any) {
    this.server.emit("order.updated", { type: "order.updated", order });
  }
}
