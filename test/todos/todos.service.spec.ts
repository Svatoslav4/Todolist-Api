import { NotFoundException } from '@nestjs/common';
import { Priority } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodosService } from '../../src/todos/todos.service.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';

describe('TodosService', () => {
  const userId = 'user-1';
  const todoId = 'todo-1';

  const prisma = {
    todo: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  let service: TodosService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new TodosService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('creates a todo for the user and converts dueDate to Date', async () => {
      const created = { id: todoId };
      prisma.todo.create.mockResolvedValue(created);

      const result = await service.create(userId, {
        title: 'Buy milk',
        description: '2 liters',
        priority: Priority.HIGH,
        dueDate: '2026-10-10T00:00:00.000Z',
      });

      expect(result).toBe(created);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          title: 'Buy milk',
          description: '2 liters',
          priority: Priority.HIGH,
          dueDate: new Date('2026-10-10T00:00:00.000Z'),
          userId,
        },
      });
    });

    it('leaves dueDate undefined when it is not provided', async () => {
      prisma.todo.create.mockResolvedValue({});

      await service.create(userId, { title: 'No date', description: '' });

      const { data } = prisma.todo.create.mock.calls[0]![0];
      expect(data.dueDate).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it("returns only the user's todos, newest first", async () => {
      const todos = [{ id: 'a' }, { id: 'b' }];
      prisma.todo.findMany.mockResolvedValue(todos);

      const result = await service.findAll(userId);

      expect(result).toBe(todos);
      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the todo when it belongs to the user', async () => {
      const todo = { id: todoId, userId };
      prisma.todo.findFirst.mockResolvedValue(todo);

      await expect(service.findOne(userId, todoId)).resolves.toBe(todo);
      expect(prisma.todo.findFirst).toHaveBeenCalledWith({
        where: { id: todoId, userId },
      });
    });

    it('throws NotFoundException when the todo does not exist', async () => {
      prisma.todo.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, todoId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates the todo and converts dueDate to Date', async () => {
      prisma.todo.findFirst.mockResolvedValue({ id: todoId, userId });
      const updated = { id: todoId, completed: true };
      prisma.todo.update.mockResolvedValue(updated);

      const result = await service.update(userId, todoId, {
        title: 'New title',
        completed: true,
        dueDate: '2026-11-01T00:00:00.000Z',
      });

      expect(result).toBe(updated);
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: todoId },
        data: {
          title: 'New title',
          description: undefined,
          priority: undefined,
          dueDate: new Date('2026-11-01T00:00:00.000Z'),
          completed: true,
        },
      });
    });

    it('throws NotFoundException and does not update a foreign/missing todo', async () => {
      prisma.todo.findFirst.mockResolvedValue(null);

      await expect(service.update(userId, todoId, { title: 'x' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.todo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the todo when it belongs to the user', async () => {
      prisma.todo.findFirst.mockResolvedValue({ id: todoId, userId });
      prisma.todo.delete.mockResolvedValue({});

      await expect(service.remove(userId, todoId)).resolves.toBeUndefined();
      expect(prisma.todo.delete).toHaveBeenCalledWith({
        where: { id: todoId },
      });
    });

    it('throws NotFoundException and does not delete a foreign/missing todo', async () => {
      prisma.todo.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, todoId)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.todo.delete).not.toHaveBeenCalled();
    });
  });
});
