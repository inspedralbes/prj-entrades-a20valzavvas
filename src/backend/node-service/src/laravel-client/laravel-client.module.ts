import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LaravelClientService } from './laravel-client.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>('LARAVEL_INTERNAL_URL'),
        timeout: config.get<number>('LARAVEL_HTTP_TIMEOUT', 5000),
      }),
    }),
  ],
  providers: [LaravelClientService],
  exports: [LaravelClientService],
})
export class LaravelClientModule {}
