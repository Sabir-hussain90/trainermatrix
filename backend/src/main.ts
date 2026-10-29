import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(process.env.PORT) || 4000;
  
  // CRITICAL FIX: Bind to '0.0.0.0' so the cloud provider can reach your app
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 API running on port ${port}`);
}

bootstrap();