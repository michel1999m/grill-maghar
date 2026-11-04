import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AdminKeyGuard } from "./admin-key.guard";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  all() {
    return this.products.all();
  }

  @Post()
  @UseGuards(AdminKeyGuard)
  create(@Body() body: any) {
    return this.products.create(body);
  }

  @Put(":id")
  @UseGuards(AdminKeyGuard)
  update(@Param("id") id: string, @Body() body: any) {
    return this.products.update(id, body);
  }

  @Delete(":id")
  @UseGuards(AdminKeyGuard)
  remove(@Param("id") id: string) {
    return { removed: this.products.remove(id) };
  }
}
