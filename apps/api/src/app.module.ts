import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersGateway } from "./orders.gateway";
import { OrdersService } from "./orders.service";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  controllers: [OrdersController, ProductsController, SettingsController],
  providers: [OrdersService, OrdersGateway, ProductsService, SettingsService]
})
export class AppModule {}
