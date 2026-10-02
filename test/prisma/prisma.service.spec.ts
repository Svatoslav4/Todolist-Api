import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../src/prisma/prisma.service.js';

describe('PrismaService', () => {
  it('connects to the database on module init', async () => {
    const service = new PrismaService();
    const connect = vi.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('propagates connection errors', async () => {
    const service = new PrismaService();
    vi.spyOn(service, '$connect').mockRejectedValue(new Error('db down'));

    await expect(service.onModuleInit()).rejects.toThrow('db down');
  });
});
