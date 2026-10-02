import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard.js';
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategies.js';

describe('JwtStrategy', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_ACCESS_SECRET', 'test-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('maps the JWT payload to the request user', async () => {
    const strategy = new JwtStrategy();

    await expect(strategy.validate({ sub: 'user-1', email: 'a@b.com' })).resolves.toEqual({
      userId: 'user-1',
      email: 'a@b.com',
    });
  });
});

describe('JwtAuthGuard', () => {
  it('exposes canActivate from the passport jwt guard', () => {
    const guard = new JwtAuthGuard();

    expect(typeof guard.canActivate).toBe('function');
  });
});
