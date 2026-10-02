import { createHash } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RefreshTokenService } from '../../src/auth/refresh-token.service.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

describe('RefreshTokenService', () => {
  const prisma = {
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  let service: RefreshTokenService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new RefreshTokenService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('returns a random token and stores only its hash with a 7 day expiry', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      prisma.refreshToken.create.mockResolvedValue({});

      const token = await service.create('user-1');

      expect(token).toMatch(/^[0-9a-f]{128}$/);
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          tokenHash: sha256(token),
          userId: 'user-1',
          expiresAt: new Date('2026-01-08T00:00:00.000Z'),
        },
      });
      const { data } = prisma.refreshToken.create.mock.calls[0]![0];
      expect(data.tokenHash).not.toBe(token);
    });

    it('generates a different token on every call', async () => {
      prisma.refreshToken.create.mockResolvedValue({});

      const first = await service.create('user-1');
      const second = await service.create('user-1');

      expect(first).not.toBe(second);
    });
  });

  describe('findValidToken', () => {
    const future = () => new Date(Date.now() + 60_000);

    it('looks the token up by its hash', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await service.findValidToken('raw-token');

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: sha256('raw-token') },
      });
    });

    it('returns null when the token is unknown', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.findValidToken('x')).resolves.toBeNull();
    });

    it('returns null when the token is revoked', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        revokedAt: new Date(),
        expiresAt: future(),
      });

      await expect(service.findValidToken('x')).resolves.toBeNull();
    });

    it('returns null when the token is expired', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.findValidToken('x')).resolves.toBeNull();
    });

    it('returns the stored token when it is valid', async () => {
      const stored = { userId: 'user-1', revokedAt: null, expiresAt: future() };
      prisma.refreshToken.findUnique.mockResolvedValue(stored);

      await expect(service.findValidToken('x')).resolves.toBe(stored);
    });
  });

  describe('revoke', () => {
    it('marks only non-revoked tokens with the given hash as revoked', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.revoke('raw-token')).resolves.toBeUndefined();

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: sha256('raw-token'), revokedAt: null },
        data: { revokedAt: new Date('2026-01-01T00:00:00.000Z') },
      });
    });
  });
});
