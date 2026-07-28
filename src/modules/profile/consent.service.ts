import { prisma } from "@/lib/prisma";

export class ConsentService {
  /**
   * Returns active extraction consent status for the user.
   */
  static async getConsent(userId: string) {
    const consent = await prisma.extractionConsent.findUnique({
      where: { userId },
    });

    if (!consent) {
      return {
        userId,
        granted: false,
        consentVersion: "v1.0",
        grantedAt: null,
        revokedAt: null,
      };
    }

    return {
      userId,
      granted: consent.granted,
      consentVersion: consent.consentVersion,
      grantedAt: consent.grantedAt,
      revokedAt: consent.revokedAt,
    };
  }

  /**
   * Sets or revokes extraction consent for the user.
   */
  static async updateConsent(userId: string, granted: boolean) {
    const now = new Date();
    return prisma.extractionConsent.upsert({
      where: { userId },
      update: {
        granted,
        grantedAt: granted ? now : undefined,
        revokedAt: granted ? null : now,
      },
      create: {
        userId,
        granted,
        consentVersion: "v1.0",
        grantedAt: now,
        revokedAt: granted ? null : now,
      },
    });
  }
}
