import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  // uploaded dish photos arrive as base64 inside the JSON body; the 100kb default is too small
  app.useBodyParser("json", { limit: "5mb" });
  // hosts route traffic in from outside the container, so bind every interface
  await app.listen(Number(process.env.PORT) || 3000, "0.0.0.0");
}
bootstrap();
