import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminKeyGuard } from "./admin-key.guard";
import { OrdersGateway } from "./orders.gateway";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService, private readonly gateway: OrdersGateway) {}

  @Get()
  @UseGuards(AdminKeyGuard)
  all() {
    return this.orders.all();
  }

  @Post()
  create(@Body() body: any) {
    const order = this.orders.create(body);
    this.gateway.broadcastCreated(order);
    return order;
  }

  @Patch(":id/status")
  @UseGuards(AdminKeyGuard)
  update(@Param("id") id: string, @Body() body: { status: string }) {
    const order = this.orders.update(id, body.status);
    if (order) this.gateway.broadcastUpdated(order);
    return order;
  }
}
