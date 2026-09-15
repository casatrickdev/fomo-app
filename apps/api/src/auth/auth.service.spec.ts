import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { EMAIL_PROVIDER } from "./email.provider";
import { PrismaService } from "../prisma/prisma.service";
import { WalletsService } from "../wallets/wallets.service";

describe("AuthService", () => {
  const prisma = {
    otpChallenge: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const wallets = { provisionForUser: jest.fn() };
  const email = { sendOtp: jest.fn() };
  const jwt = { signAsync: jest.fn().mockResolvedValue("access.token") };
  const config = {
    get: jest.fn((key: string, fallback?: string) => {
      if (key === "OTP_EXPIRY_SECONDS") return 300;
      if (key === "OTP_DEV_ECHO") return "true";
      return fallback;
    }),
    getOrThrow: jest.fn().mockReturnValue("test-secret"),
  };

  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: WalletsService, useValue: wallets },
        { provide: EMAIL_PROVIDER, useValue: email },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it("issues an OTP and echoes the code in development", async () => {
    prisma.otpChallenge.create.mockResolvedValue({});
    const result = await service.requestOtp({ email: "flyer@kite.dev" });
    expect(result.ok).toBe(true);
    expect(result.devCode).toMatch(/^\d{6}$/);
    expect(email.sendOtp).toHaveBeenCalledWith(
      "flyer@kite.dev",
      result.devCode,
    );
  });

  it("rejects an invalid OTP", async () => {
    prisma.otpChallenge.findFirst.mockResolvedValue(null);
    await expect(
      service.verifyOtp({ email: "flyer@kite.dev", code: "000000" }),
    ).rejects.toThrow("Invalid or expired code");
  });
});
