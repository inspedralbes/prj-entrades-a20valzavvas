import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { LaravelClientService } from "../laravel-client/laravel-client.service";
import { SeatsGateway } from "../gateway/seats.gateway";
import { EstatSeient } from "shared/types/seat.types";

@Injectable()
export class ReservationsScheduler {
  private readonly logger = new Logger(ReservationsScheduler.name);

  constructor(
    private readonly laravelClient: LaravelClientService,
    private readonly seatsGateway: SeatsGateway,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async releaseExpired(): Promise<void> {
    try {
      const { released } =
        await this.laravelClient.releaseExpiredReservations();

      for (const { seatId, eventId } of released) {
        this.seatsGateway.server
          .to(`event:${eventId}`)
          .emit("seient:canvi-estat", {
            seatId,
            estat: EstatSeient.DISPONIBLE,
          });
      }

      if (released.length > 0) {
        this.logger.log(`Released ${released.length} expired reservation(s)`);
      }
    } catch (error) {
      this.logger.error("Failed to release expired reservations", error);
    }
  }
}
