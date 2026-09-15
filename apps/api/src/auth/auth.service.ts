import { NotificationType, Prisma } from "@prisma/client";
import type {
  AuthSession,
  RequestOtpInput,
  VerifyOtpInput,
} from "@kite/shared-types";
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { WalletsService } from "../wallets/wallets.service";
import {
  generateOtpCode,
  generateRefreshToken,
  placeholderHandle,
  sha256,
} from "../common/crypto";
import { EMAIL_PROVIDER, EmailProvider } from "./email.provider";
import { toSessionUser } from "../users/user.mapper";

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly wallets: WalletsService,
    @Inject(EMAIL_PROVIDER) private readonly email: EmailProvider,
  ) {}

  async requestOtp(input: RequestOtpInput) {
    const email = input.email.toLowerCase().trim();
    const code = generateOtpCode();
    const expirySeconds = Number(this.config.get("OTP_EXPIRY_SECONDS", 300));

    await this.prisma.otpChallenge.create({
      data: {
        email,
        codeHash: sha256(`${email}:${code}`),
        expiresAt: new Date(Date.now() + expirySeconds * 1000),
      },
    });

    await this.email.sendOtp(email, code);

    const echo = this.config.get("OTP_DEV_ECHO") === "true";
    return {
      ok: true,
      expiresInSeconds: expirySeconds,
      ...(echo ? { devCode: code } : {}),
    };
  }

  async verifyOtp(input: VerifyOtpInput): Promise<AuthSession> {
    const email = input.email.toLowerCase().trim();
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        email,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!challenge || challenge.codeHash !== sha256(`${email}:${input.code}`)) {
      throw new UnauthorizedException("Invalid or expired code");
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    const user = await this.findOrCreateUser(email);
    await this.wallets.provisionForUser(user.id);
    return this.issueSession(user.id);
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash: sha256(refreshToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.issueSession(session.userId);
  }

  async logout(refreshToken: string): Promise<{ ok: true }> {
    await this.prisma.session.updateMany({
      where: { refreshTokenHash: sha256(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  private async findOrCreateUser(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return existing;
    }

    try {
      return await this.prisma.user.create({
        data: {
          email,
          handle: placeholderHandle(),
          displayName: "New flyer",
          notificationPreferences: {
            create: Object.values(NotificationType).map((type) => ({
              type,
              enabled: true,
            })),
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "Could not allocate a unique handle, retry OTP verify",
        );
      }
      throw error;
    }
  }

  private async issueSession(userId: string): Promise<AuthSession> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        wallets: true,
        _count: { select: { followers: true, following: true } },
      },
    });

    const refreshToken = generateRefreshToken();
    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: sha256(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
      },
    });

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, handle: user.handle },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: `${ACCESS_TTL_SECONDS}s`,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresInSeconds: ACCESS_TTL_SECONDS,
      user: toSessionUser(user),
    };
  }
}
