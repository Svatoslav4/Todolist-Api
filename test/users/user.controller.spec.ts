import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersController } from '../../src/users/user.controller.js';
import type { UserService } from '../../src/users/user.service.js';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard.js';

describe('UsersController', () => {
  const userService = { findById: vi.fn() };

  let controller: UsersController;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new UsersController(userService as unknown as UserService);
  });

  it('getMe returns the current user profile', async () => {
    userService.findById.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

    await expect(controller.getMe({ userId: 'u1', email: 'a@b.com' })).resolves.toEqual({
      id: 'u1',
      email: 'a@b.com',
    });
    expect(userService.findById).toHaveBeenCalledWith('u1');
  });

  it('getMe is protected by JwtAuthGuard', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      Object.getOwnPropertyDescriptor(UsersController.prototype, 'getMe')!.value,
    );

    expect(guards).toContain(JwtAuthGuard);
  });
});
