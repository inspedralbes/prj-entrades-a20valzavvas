import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JwtWsGuard } from "./jwt-ws.guard";
import { LaravelClientModule } from "../laravel-client/laravel-client.module";

@Module({
  imports: [
    LaravelClientModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
      }),
    }),
  ],
  providers: [JwtWsGuard],
  exports: [JwtWsGuard, JwtModule],
})
export class AuthModule {}
