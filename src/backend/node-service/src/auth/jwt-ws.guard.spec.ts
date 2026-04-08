import { ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { JwtWsGuard } from "./jwt-ws.guard";

function buildContext(token: string | undefined): ExecutionContext {
  const client = {
    handshake: {
      auth: token !== undefined ? { token } : {},
      query: {},
    },
    data: {} as Record<string, string>,
  };

  return {
    switchToWs: () => ({
      getClient: () => client,
    }),
  } as unknown as ExecutionContext;
}

function buildContextWithQueryToken(token: string): ExecutionContext {
  const client = {
    handshake: {
      auth: {},
      query: { token },
    },
    data: {} as Record<string, string>,
  };

  return {
    switchToWs: () => ({
      getClient: () => client,
    }),
  } as unknown as ExecutionContext;
}

describe("JwtWsGuard", () => {
  let guard: JwtWsGuard;
  let mockVerifyAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockVerifyAsync = vi.fn();

    const mockJwtService = {
      verifyAsync: mockVerifyAsync,
    } as unknown as JwtService;
    const mockConfigService = {
      get: vi.fn().mockReturnValue("test_secret"),
    } as unknown as ConfigService;

    guard = new JwtWsGuard(mockJwtService, mockConfigService);
  });

  it("should return true and set socket.data when token is valid", async () => {
    mockVerifyAsync.mockResolvedValue({ sub: "user-uuid-123", role: "buyer" });

    const ctx = buildContext("valid.jwt.token");
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    const client = ctx
      .switchToWs()
      .getClient<{ data: Record<string, string> }>();
    expect(client.data.userId).toBe("user-uuid-123");
    expect(client.data.role).toBe("buyer");
  });

  it("should throw WsException when no token is provided", async () => {
    const ctx = buildContext(undefined);

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new WsException("Unauthorized"),
    );
  });

  it("should use query.token as fallback when auth.token is absent", async () => {
    mockVerifyAsync.mockResolvedValue({ sub: "user-uuid-456", role: "admin" });

    const ctx = buildContextWithQueryToken("fallback.jwt.token");
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    const client = ctx
      .switchToWs()
      .getClient<{ data: Record<string, string> }>();
    expect(client.data.userId).toBe("user-uuid-456");
  });

  it("should throw WsException when token is expired", async () => {
    const expiredError = new Error("jwt expired");
    expiredError.name = "TokenExpiredError";
    mockVerifyAsync.mockRejectedValue(expiredError);

    const ctx = buildContext("expired.jwt.token");

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new WsException("Unauthorized"),
    );
  });

  it("should throw WsException when token signature is invalid", async () => {
    const invalidError = new Error("invalid signature");
    invalidError.name = "JsonWebTokenError";
    mockVerifyAsync.mockRejectedValue(invalidError);

    const ctx = buildContext("tampered.jwt.token");

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new WsException("Unauthorized"),
    );
  });
});
