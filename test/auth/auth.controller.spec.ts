import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from '../../src/auth/auth.controller.js';
import type { AuthService } from '../../src/auth/auth.service.js';

describe('AuthController', () => {
  const authService = {
    register: vi.fn(),
    login: vi.fn(),
    refreshAccessToken: vi.fn(),
    logout: vi.fn(),
  };

  let controller: AuthController;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('register delegates to the service', async () => {
    const dto = {
      email: 'a@b.com',
      password: '12345678',
      firstName: 'Svyat',
      lastName: 'Sakati',
    };
    authService.register.mockResolvedValue({ id: 'u1' });

    await expect(controller.register(dto)).resolves.toEqual({ id: 'u1' });
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('login delegates to the service', async () => {
    const dto = { email: 'a@b.com', password: '12345678' };
    authService.login.mockResolvedValue({ token: 't' });

    await expect(controller.login(dto)).resolves.toEqual({ token: 't' });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('refresh passes only the refresh token to the service', async () => {
    authService.refreshAccessToken.mockResolvedValue({ accessToken: 'a' });

    await expect(controller.refresh({ refreshToken: 'r'.repeat(32) })).resolves.toEqual({
      accessToken: 'a',
    });
    expect(authService.refreshAccessToken).toHaveBeenCalledWith('r'.repeat(32));
  });

  it('logout passes only the refresh token to the service', async () => {
    authService.logout.mockResolvedValue({ message: 'ok' });

    await expect(controller.logout({ refreshToken: 'r'.repeat(32) })).resolves.toEqual({
      message: 'ok',
    });
    expect(authService.logout).toHaveBeenCalledWith('r'.repeat(32));
  });

  it('propagates service errors', async () => {
    authService.login.mockRejectedValue(new Error('boom'));

    await expect(controller.login({ email: 'a@b.com', password: '12345678' })).rejects.toThrow(
      'boom',
    );
  });
});
