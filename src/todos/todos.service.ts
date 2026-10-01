import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateTodoDto } from "./dto/create-todo.dto.js";
import { UpdateTodoDto } from "./dto/update-todo.dto.js";

@Injectable()
export class TodosService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string,dto: CreateTodoDto) {
        return this.prisma.todo.create({
            data: {
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                dueDate: dto.dueDate
                    ?new Date(dto.dueDate): undefined,
                    userId
            }
        })
    }

    async findAll(userId: string) {
        return this.prisma.todo.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    async findOne(userId: string,todoId: string) {
        const todo = await this.prisma.todo.findFirst({
            where: {
                id: todoId,
                userId
            }
        })
        if(!todo) {
            throw new NotFoundException('Todo not found')
        }

        return todo
    }

    async update(userId: string,todoId: string,dto: UpdateTodoDto,) {
      const todo =
        await this.prisma.todo.findFirst({
          where: {
            id: todoId,
            userId,
          },
        });

      if (!todo) {
        throw new NotFoundException(
          'Todo not found',
        );
      }

      return this.prisma.todo.update({
        where: {
          id: todoId,
        },
        data: {
          title: dto.title,
          description: dto.description,
          priority: dto.priority,
          dueDate: dto.dueDate
            ? new Date(dto.dueDate)
            : undefined,
          completed: dto.completed,
        },
      });
    }
}