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
  StatsActualitzacioPayload,
  SeientReservarPayload,
  SeientAlliberarPayload,
  ReservaConfirmadaPayload,
  ReservaRebutjadaPayload,
  ErrorGeneralPayload,
  CompraConfirmarPayload,
  CompraCompletadaPayload,
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
        const eventId = eventRoom.replace("event:", "");
        await this.broadcastStats(eventId);
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

  emitStatsActualitzacio(
    eventId: string,
    payload: StatsActualitzacioPayload,
  ): void {
    this.server.to(`event:${eventId}`).emit("stats:actualitzacio", payload);
  }

  @SubscribeMessage("compra:confirmar")
  async handleCompraConfirmar(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: CompraConfirmarPayload,
  ): Promise<void> {
    if (!payload.seients || payload.seients.length === 0) {
      return;
    }

    const eventRoom = `event:${payload.eventId}`;

    for (const seient of payload.seients) {
      const canviPayload: SeientCanviEstatPayload = {
        seatId: seient.seatId,
        estat: EstatSeient.VENUT,
        fila: seient.fila,
        numero: seient.numero,
      };
      this.server.to(eventRoom).emit("seient:canvi-estat", canviPayload);
    }

    const completadaPayload: CompraCompletadaPayload = {
      orderId: payload.orderId,
      seients: payload.seients.map((s) => `${s.fila}${s.numero}`),
    };
    socket.emit("compra:completada", completadaPayload);

    await this.broadcastStats(payload.eventId);
  }

  @SubscribeMessage("seient:alliberar")
  async handleSeientAlliberar(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: SeientAlliberarPayload,
  ): Promise<void> {
    const result = await this.laravelClient.releaseSeat(
      payload.seatId,
      socket.data.userId,
      socket.data.token,
    );

    if (result.ok) {
      const canviPayload: SeientCanviEstatPayload = {
        seatId: payload.seatId,
        estat: EstatSeient.DISPONIBLE,
        fila: "",
        numero: 0,
      };
      const eventRoom = Array.from(socket.rooms).find((r) =>
        r.startsWith("event:"),
      );
      if (eventRoom) {
        this.server.to(eventRoom).emit("seient:canvi-estat", canviPayload);
        const eventId = eventRoom.replace("event:", "");
        await this.broadcastStats(eventId);
      }
    } else {
      const errorPayload: ErrorGeneralPayload = {
        codi: result.motiu,
        missatge: result.motiu,
      };
      socket.emit("error:general", errorPayload);
    }
  }

  private async broadcastStats(eventId: string): Promise<void> {
    try {
      const stats = await this.laravelClient.getStats(eventId);
      const sockets = await this.server
        .in(`event:${eventId}`)
        .fetchSockets();
      stats.usuaris = sockets.length;
      this.emitStatsActualitzacio(eventId, stats);
    } catch {
      // Stats broadcast is best-effort; don't fail the main operation
    }
  }
}
