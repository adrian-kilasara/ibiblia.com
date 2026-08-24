import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  // rawBody keeps the unparsed request buffer available for payment webhook signature checks.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix("api");
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  const config = new DocumentBuilder()
    .setTitle("iBiblia API")
    .setDescription("Content, donations, and submissions API for iBiblia.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Cloud hosts (Render, Railway, Koyeb, Fly…) inject PORT; fall back to API_PORT locally.
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  new Logger("Bootstrap").log(`iBiblia API listening on http://localhost:${port}/api`);
}

void bootstrap();
