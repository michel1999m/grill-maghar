import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  // uploaded dish photos arrive as base64 inside the JSON body; the 100kb default is too small
  app.useBodyParser("json", { limit: "5mb" });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
