// Register @shared/* path aliases for runtime resolution (ts-node / direct execution)
// tsconfig.json ts-node.require also handles this for ts-node invocations
import 'tsconfig-paths/register';

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env['PORT'] ?? 3001);
}

bootstrap();
