import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../src/auth/auth.service.js';
import type { RefreshTokenService } from '../../src/auth/refresh-token.service.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
  const jwtService = { signAsync: vi.fn() };
  const refreshTokenService = {
    create: vi.fn(),
    findValidToken: vi.fn(),
    revoke: vi.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      refreshTokenService as unknown as RefreshTokenService,
    );
  });

  describe('register', () => {
    const dto = {
      email: 'test@gmail.com',
      password: '12345678',
      firstName: 'Svyat',
      lastName: 'Sakati',
    };

    it('throws ConflictException when the email is taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

      await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('hashes the password, creates the user and hides the hash', async () => {
      const createdAt = new Date();
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: dto.email,
        passwordHash: 'hashed',
        firstname: dto.firstName,
        lastname: dto.lastName,
        createdAt,
      });

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          passwordHash: 'hashed',
          firstname: dto.firstName,
          lastname: dto.lastName,
        },
      });
      expect(result).toEqual({
        id: 'u1',
        email: dto.email,
        firstName: dto.firstName,
        lastname: dto.lastName,
        createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    const dto = { email: 'test@gmail.com', password: '12345678' };
    const user = { id: 'u1', email: dto.email, passwordHash: 'hashed' };

    it('throws UnauthorizedException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(refreshTokenService.create).not.toHaveBeenCalled();
    });

    it('returns an access token and a refresh token on success', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue('access-jwt');
      refreshTokenService.create.mockResolvedValue('refresh-token');

      const result = await service.login(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, 'hashed');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'u1',
        email: dto.email,
      });
      expect(refreshTokenService.create).toHaveBeenCalledWith('u1');
      expect(Object.values(result)).toEqual(['access-jwt', 'refresh-token']);
    });
  });

  describe('refreshAccessToken', () => {
    it('throws UnauthorizedException for an invalid refresh token', async () => {
      refreshTokenService.findValidToken.mockResolvedValue(null);

      await expect(service.refreshAccessToken('bad')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the token owner is gone', async () => {
      refreshTokenService.findValidToken.mockResolvedValue({ userId: 'u1' });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshAccessToken('ok')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('issues a new access token for a valid refresh token', async () => {
      refreshTokenService.findValidToken.mockResolvedValue({ userId: 'u1' });
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      jwtService.signAsync.mockResolvedValue('new-access');

      await expect(service.refreshAccessToken('ok')).resolves.toEqual({
        accessToken: 'new-access',
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'a@b.com',
      });
    });
  });

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      refreshTokenService.revoke.mockResolvedValue(undefined);

      await expect(service.logout('token')).resolves.toEqual({
        message: 'Logged out successfully',
      });
      expect(refreshTokenService.revoke).toHaveBeenCalledWith('token');
    });
  });
});
