import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SeatsGateway } from "./seats.gateway";

@Module({
  imports: [AuthModule],
  providers: [SeatsGateway],
  exports: [SeatsGateway],
})
export class GatewayModule {}
