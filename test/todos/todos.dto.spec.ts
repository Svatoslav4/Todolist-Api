import { describe, expect, it } from 'vitest';
import { validate } from 'class-validator';
import { Priority } from '@prisma/client';
import { CreateTodoDto } from '../../src/todos/dto/create-todo.dto.js';
import { UpdateTodoDto } from '../../src/todos/dto/update-todo.dto.js';

const build = <T extends object>(Dto: new () => T, data: Record<string, unknown>) =>
  Object.assign(new Dto(), data);

const failedProps = async (dto: object) => (await validate(dto)).map((e) => e.property);

describe('CreateTodoDto', () => {
  it('accepts a valid payload', async () => {
    const dto = build(CreateTodoDto, {
      title: 'Task',
      description: 'desc',
      priority: Priority.LOW,
      dueDate: '2026-10-10T00:00:00.000Z',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts only a title', async () => {
    expect(await validate(build(CreateTodoDto, { title: 'Task' }))).toHaveLength(0);
  });

  it('rejects a missing title', async () => {
    expect(await failedProps(build(CreateTodoDto, {}))).toContain('title');
  });

  it('rejects an empty title', async () => {
    expect(await failedProps(build(CreateTodoDto, { title: '' }))).toContain('title');
  });

  it('rejects a title longer than 200 characters', async () => {
    const dto = build(CreateTodoDto, { title: 'a'.repeat(201) });

    expect(await failedProps(dto)).toContain('title');
  });

  it('rejects a description longer than 2000 characters', async () => {
    const dto = build(CreateTodoDto, { title: 'ok', description: 'a'.repeat(2001) });

    expect(await failedProps(dto)).toContain('description');
  });

  it('rejects an unknown priority', async () => {
    const dto = build(CreateTodoDto, { title: 'ok', priority: 'URGENT' });

    expect(await failedProps(dto)).toContain('priority');
  });

  it('rejects an invalid dueDate', async () => {
    const dto = build(CreateTodoDto, { title: 'ok', dueDate: 'tomorrow' });

    expect(await failedProps(dto)).toContain('dueDate');
  });
});

describe('UpdateTodoDto', () => {
  it('accepts an empty payload', async () => {
    expect(await validate(build(UpdateTodoDto, {}))).toHaveLength(0);
  });

  it('accepts all valid fields', async () => {
    const dto = build(UpdateTodoDto, {
      title: 'New',
      description: 'desc',
      priority: Priority.HIGH,
      dueDate: '2026-10-10T00:00:00.000Z',
      completed: true,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects an empty title', async () => {
    expect(await failedProps(build(UpdateTodoDto, { title: '' }))).toContain('title');
  });

  it('rejects a non-boolean completed', async () => {
    expect(await failedProps(build(UpdateTodoDto, { completed: 'yes' }))).toContain('completed');
  });

  it('rejects an unknown priority', async () => {
    expect(await failedProps(build(UpdateTodoDto, { priority: 'NOPE' }))).toContain('priority');
  });

  it('rejects an invalid dueDate', async () => {
    expect(await failedProps(build(UpdateTodoDto, { dueDate: 'x' }))).toContain('dueDate');
  });
});
