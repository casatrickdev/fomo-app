import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { Server, Socket } from "socket.io";
import type { JwtPayload } from "../auth/jwt.strategy";

@WebSocketGateway({
  namespace: "/feed",
  cors: { origin: true },
})
export class FeedGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(FeedGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.readToken(client);
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
      await client.join(`user:${payload.sub}`);
      await client.join("live");
      this.logger.log(`feed connected ${payload.handle}`);
    } catch {
      client.emit("error", { message: "unauthorized" });
      client.disconnect();
    }
  }

  @SubscribeMessage("ping")
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit("pong", { at: new Date().toISOString() });
  }

  emitTrade(item: unknown) {
    this.server.to("live").emit("trade", item);
  }

  private readToken(client: Socket): string {
    const auth = client.handshake.auth as { token?: string };
    if (auth.token) {
      return auth.token;
    }
    const header = client.handshake.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      return header.slice(7);
    }
    throw new Error("missing token");
  }
}
