import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodosController } from '../../src/todos/todos.controller.js';
import type { TodosService } from '../../src/todos/todos.service.js';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard.js';

describe('TodosController', () => {
  const user = { userId: 'user-1', email: 'a@b.com' };

  const todosService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  let controller: TodosController;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new TodosController(todosService as unknown as TodosService);
  });

  it('is protected by JwtAuthGuard', () => {
    const guards = Reflect.getMetadata('__guards__', TodosController);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('create delegates to the service with the current user id', async () => {
    const dto = { title: 'Task', description: '' };
    todosService.create.mockResolvedValue({ id: '1' });

    await expect(controller.create(user, dto)).resolves.toEqual({ id: '1' });
    expect(todosService.create).toHaveBeenCalledWith(user.userId, dto);
  });

  it('findAll delegates to the service', async () => {
    todosService.findAll.mockResolvedValue([]);

    await expect(controller.findAll(user)).resolves.toEqual([]);
    expect(todosService.findAll).toHaveBeenCalledWith(user.userId);
  });

  it('findOne delegates to the service', async () => {
    todosService.findOne.mockResolvedValue({ id: 'todo-1' });

    await expect(controller.findOne(user, 'todo-1')).resolves.toEqual({
      id: 'todo-1',
    });
    expect(todosService.findOne).toHaveBeenCalledWith(user.userId, 'todo-1');
  });

  it('update delegates to the service', async () => {
    const dto = { completed: true };
    todosService.update.mockResolvedValue({ id: 'todo-1', completed: true });

    await controller.update(user, 'todo-1', dto);

    expect(todosService.update).toHaveBeenCalledWith(user.userId, 'todo-1', dto);
  });

  it('remove delegates to the service and responds with 204', async () => {
    todosService.remove.mockResolvedValue(undefined);

    await controller.remove(user, 'todo-1');

    expect(todosService.remove).toHaveBeenCalledWith(user.userId, 'todo-1');
    expect(Reflect.getMetadata('__httpCode__', TodosController.prototype.remove)).toBe(204);
  });

  it('propagates service errors', async () => {
    todosService.findOne.mockRejectedValue(new Error('boom'));

    await expect(controller.findOne(user, 'x')).rejects.toThrow('boom');
  });
});
