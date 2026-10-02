import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CurrentUser } from '../../src/common/decorators/current-user.decorator.js';

describe('CurrentUser decorator', () => {
  class Host {
    handler(@CurrentUser() _user: CurrentUser) {}
  }

  const getFactory = () => {
    const args = Reflect.getMetadata('__routeArguments__', Host, 'handler');
    return Object.values<{ factory: (data: unknown, ctx: ExecutionContext) => unknown }>(args)[0]!
      .factory;
  };

  it('returns request.user from the HTTP context', () => {
    const user = { userId: 'u1', email: 'a@b.com' };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;

    expect(getFactory()(undefined, ctx)).toBe(user);
  });
});
