import { Injectable, Logger } from "@nestjs/common";
import type { EmailProvider } from "./email.provider";

@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ConsoleEmailProvider.name);

  sendOtp(email: string, code: string): Promise<void> {
    this.logger.log(`OTP for ${email}: ${code}`);
    return Promise.resolve();
  }
}
