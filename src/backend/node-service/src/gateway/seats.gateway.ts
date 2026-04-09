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
import { SeientCanviEstatPayload } from "shared/types/socket.types";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/",
})
@UseGuards(JwtWsGuard)
export class SeatsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("event:unir")
  handleUnirEvent(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: { eventId: string },
  ): void {
    socket.join(`event:${payload.eventId}`);
  }

  emitCanviEstat(eventId: string, payload: SeientCanviEstatPayload): void {
    this.server.to(`event:${eventId}`).emit("seient:canvi-estat", payload);
  }
}
