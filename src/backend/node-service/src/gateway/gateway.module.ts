import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LaravelClientModule } from "../laravel-client/laravel-client.module";
import { SeatsGateway } from "./seats.gateway";

@Module({
  imports: [AuthModule, LaravelClientModule],
  providers: [SeatsGateway],
  exports: [SeatsGateway],
})
export class GatewayModule {}
