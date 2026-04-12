import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { UseGuards } from "@nestjs/common";
import { Server } from "socket.io";
import { JwtWsGuard } from "../auth/jwt-ws.guard";
import { AuthenticatedSocket } from "../auth/authenticated-socket.interface";
import { LaravelClientService } from "../laravel-client/laravel-client.service";
import type {
  SeientCanviEstatPayload,
  SeientReservarPayload,
  ReservaConfirmadaPayload,
  ReservaRebutjadaPayload,
} from "shared/types/socket.types";
import { EstatSeient } from "shared/types/seat.types";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/",
})
@UseGuards(JwtWsGuard)
export class SeatsGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly laravelClient: LaravelClientService) {}

  @SubscribeMessage("event:unir")
  handleUnirEvent(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: { eventId: string },
  ): void {
    socket.join(`event:${payload.eventId}`);
  }

  @SubscribeMessage("seient:reservar")
  async handleSeientReservar(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: SeientReservarPayload,
  ): Promise<void> {
    const result = await this.laravelClient.reserveSeat(
      payload.seatId,
      socket.data.token,
    );

    if (result.ok) {
      const confirmPayload: ReservaConfirmadaPayload = {
        seatId: payload.seatId,
        expiraEn: result.reservation.expires_at,
      };
      socket.emit("reserva:confirmada", confirmPayload);

      const canviPayload: SeientCanviEstatPayload = {
        seatId: result.seat.id,
        estat: EstatSeient.RESERVAT,
        fila: result.seat.fila,
        numero: result.seat.numero,
      };
      const eventRoom = Array.from(socket.rooms).find((r) =>
        r.startsWith("event:"),
      );
      if (eventRoom) {
        this.server.to(eventRoom).emit("seient:canvi-estat", canviPayload);
      }
    } else {
      const rebutjadaPayload: ReservaRebutjadaPayload = {
        seatId: payload.seatId,
        motiu: result.motiu,
      };
      socket.emit("reserva:rebutjada", rebutjadaPayload);
    }
  }

  emitCanviEstat(eventId: string, payload: SeientCanviEstatPayload): void {
    this.server.to(`event:${eventId}`).emit("seient:canvi-estat", payload);
  }
}
