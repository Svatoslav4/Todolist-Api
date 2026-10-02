import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserService } from '../../src/users/user.service.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';

describe('UserService', () => {
  const prisma = { user: { findUnique: vi.fn() } };

  let service: UserService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new UserService(prisma as unknown as PrismaService);
  });

  it('returns the user selecting only public fields', async () => {
    const user = { id: 'u1', email: 'a@b.com' };
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.findById('u1')).resolves.toBe(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u1' },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('never selects the password hash', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

    await service.findById('u1');

    const { select } = prisma.user.findUnique.mock.calls[0]![0];
    expect(select).not.toHaveProperty('passwordHash');
  });

  it('throws NotFoundException when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
