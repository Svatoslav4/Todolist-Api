import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { LoginDto } from '../../src/auth/dto/login.dto.js';
import { RefreshTokenDto } from '../../src/auth/dto/refresh-token.dto.js';
import { RegisterDto } from '../../src/auth/dto/register.dto.js';

const build = <T extends object>(Dto: new () => T, data: Record<string, unknown>) =>
  Object.assign(new Dto(), data);

const failedProps = async (dto: object) => (await validate(dto)).map((e) => e.property);

describe('RegisterDto', () => {
  const valid = {
    email: 'test@gmail.com',
    password: '12345678',
    firstName: 'Svyat',
    lastName: 'Sakati',
  };

  it('accepts a valid payload', async () => {
    expect(await validate(build(RegisterDto, valid))).toHaveLength(0);
  });

  it('accepts a payload without optional names', async () => {
    const { email, password } = valid;

    expect(await validate(build(RegisterDto, { email, password }))).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = build(RegisterDto, { ...valid, email: 'not-an-email' });

    expect(await failedProps(dto)).toContain('email');
  });

  it('rejects a missing password', async () => {
    const dto = build(RegisterDto, { email: valid.email });

    expect(await failedProps(dto)).toContain('password');
  });

  it('rejects names shorter than 2 characters', async () => {
    const dto = build(RegisterDto, { ...valid, firstName: 'S', lastName: 'S' });

    expect(await failedProps(dto)).toEqual(expect.arrayContaining(['firstName', 'lastName']));
  });
});

describe('LoginDto', () => {
  it('accepts valid credentials', async () => {
    const dto = build(LoginDto, { email: 'a@b.com', password: '12345678' });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = build(LoginDto, { email: 'nope', password: '12345678' });

    expect(await failedProps(dto)).toContain('email');
  });

  it('rejects a password shorter than 8 characters', async () => {
    const dto = build(LoginDto, { email: 'a@b.com', password: '1234567' });

    expect(await failedProps(dto)).toContain('password');
  });
});

describe('RefreshTokenDto', () => {
  it('accepts a token of at least 32 characters', async () => {
    const dto = build(RefreshTokenDto, { refreshToken: 'a'.repeat(32) });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a short token', async () => {
    const dto = build(RefreshTokenDto, { refreshToken: 'short' });

    expect(await failedProps(dto)).toContain('refreshToken');
  });

  it('rejects a missing token', async () => {
    expect(await failedProps(build(RefreshTokenDto, {}))).toContain('refreshToken');
  });
});
