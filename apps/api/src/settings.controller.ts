import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { AdminKeyGuard } from "./admin-key.guard";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Put()
  @UseGuards(AdminKeyGuard)
  update(@Body() body: any) {
    return this.settings.update(body);
  }
}
