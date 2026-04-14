import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { GatewayModule } from "../gateway/gateway.module";
import { LaravelClientModule } from "../laravel-client/laravel-client.module";
import { ReservationsScheduler } from "./reservations.scheduler";

@Module({
  imports: [ScheduleModule.forRoot(), GatewayModule, LaravelClientModule],
  providers: [ReservationsScheduler],
  exports: [ReservationsScheduler],
})
export class SchedulerModule {}
